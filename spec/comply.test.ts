// The promises Comply makes that the build can't check. Most of them keep the
// course's designed badness in place: a test here fails when something gets
// "fixed" that was meant to stay broken, as well as when two pages disagree by
// accident.
//
// Tests for content that doesn't exist yet are `it.skip`. The commit that
// writes that content switches its test on (see CLAUDE.md, "Working loop").
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contradictions } from "./contradictions";

// --- Course facts the tests enforce --------------------------------------

/** Weeks 1..LAST_WORKSHOP_WEEK are workshops; the rest are lectures. */
const LAST_WORKSHOP_WEEK = 6;
/** A lecture runs at least this long. */
const LECTURE_MIN_MINUTES = 180;
/** A workshop is one hour of contact followed by a two-hour drop-in. */
const WORKSHOP_MINUTES = 60;
const DROP_IN_MINUTES = 120;
/** Census date for the 2027 Semester 1 teaching period. */
const CENSUS = "2027-03-31";
/** ACT public holidays inside the teaching period (Canberra Day, Good
 *  Friday, Easter Monday). */
const ACT_PUBLIC_HOLIDAYS = ["2027-03-08", "2027-03-26", "2027-03-29"];
const NOT_RECORDED = "This workshop is not recorded.";
const NO_RUBRIC = "Marking criteria are not released.";
const PLATFORMS = ["Wattle", "Canvas", "Ed", "Teams", "email"];
const MIN_PRESCRIBED_TEXTS = 20;
const MIN_NOT_LISTED = 10;
/** The week 9 generated lecture, frozen once the author has chosen what to
 *  keep. Set sha256 at that point and switch its test on. */
const FROZEN = { path: "src/content/lectures/week-09.md", sha256: "" };

// --- Reading the build ------------------------------------------------------

interface ApiNode {
  id: string;
  type: string;
  title: string;
  meta?: Record<string, unknown>;
}

const DIST = resolve("dist");
const api = JSON.parse(readFileSync(join(DIST, "api/index.json"), "utf8")) as {
  nodes: ApiNode[];
};
const nodes = (type: string) => api.nodes.filter((n) => n.type === type);
const meta = (n: ApiNode) => n.meta ?? {};

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    if (e.isDirectory()) return e.name === "_astro" || e.name === "pagefind" ? [] : htmlFiles(path);
    return e.name.endsWith(".html") ? [path] : [];
  });
}

/** Visible text of a built page, with whitespace and quotes normalised. */
function visibleText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
const normalise = (s: string) => visibleText(s);

const pageFile = (page: string) => join(DIST, page, "index.html");
const pageHtml = (page: string) => readFileSync(pageFile(page), "utf8");
const pageText = (page: string) => visibleText(pageHtml(page));

const minutes = (hhmm: unknown): number => {
  const m = String(hhmm).match(/^(\d{2}):(\d{2})$/);
  if (!m) throw new Error(`expected "HH:MM", got ${String(hhmm)}`);
  return Number(m[1]) * 60 + Number(m[2]);
};
const day = (value: unknown) => String(value).slice(0, 10);

const workshops = () => nodes("sessions").filter((n) => meta(n).kind !== "lab");
const labs = () => nodes("sessions").filter((n) => meta(n).kind === "lab");

// --- Designed incoherence ---------------------------------------------------

describe("the contradiction registry", () => {
  it("places every contradiction on at least two different pages", () => {
    for (const c of contradictions) {
      const pages = new Set(c.claims.map((claim) => claim.page));
      expect(pages.size, `${c.id} needs two pages to contradict each other`).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps every registered phrase on its page", () => {
    for (const c of contradictions) {
      for (const claim of c.claims) {
        expect(existsSync(pageFile(claim.page)), `${c.id}: no page "${claim.page}"`).toBe(true);
        expect(pageText(claim.page), `${c.id}: phrase gone from "${claim.page}"`).toContain(
          normalise(claim.text),
        );
      }
    }
  });

  it.skip("gives every week at least one registered contradiction", () => {
    for (let week = 1; week <= 12; week++) {
      expect(
        contradictions.some((c) => c.week === week),
        `week ${week} has no registered contradiction`,
      ).toBe(true);
    }
  });
});

// --- Fiction boundary ---------------------------------------------------------

describe("the fiction boundary", () => {
  it("names no course code but SLOPxxxx", () => {
    for (const file of htmlFiles(DIST)) {
      const codes = visibleText(readFileSync(file, "utf8")).match(/\b[A-Z]{4}\d{4}\b/g) ?? [];
      const foreign = codes.filter((code) => !code.startsWith("SLOP"));
      expect(foreign, `${file} names a real-style course code`).toEqual([]);
    }
  });

  it("mentions ANU only on the About page", () => {
    const allowed = pageFile("about");
    for (const file of htmlFiles(DIST)) {
      if (file === allowed) continue;
      const text = visibleText(readFileSync(file, "utf8"));
      expect(text, `${file} mentions ANU`).not.toMatch(/\bANU|Australian National University/);
    }
  });
});

// --- Assessment -----------------------------------------------------------------

describe("assessment", () => {
  it("adds up to exactly 100%", () => {
    const total = nodes("assessments").reduce((sum, n) => sum + Number(meta(n).weight), 0);
    expect(total).toBe(100);
  });

  it("never releases a rubric", () => {
    for (const n of nodes("assessments")) {
      expect(meta(n).marking, `${n.id} publishes marking criteria`).toBeUndefined();
      expect(pageText(n.id), `${n.id} doesn't withhold its criteria`).toContain(NO_RUBRIC);
    }
  });

  it("returns every mark after the census date", () => {
    for (const n of nodes("assessments")) {
      const returned = meta(n).returned;
      expect(returned, `${n.id} has no returned: date`).toBeDefined();
      expect(day(returned) > CENSUS, `${n.id} is returned before census`).toBe(true);
    }
  });

  it("falls due on a public holiday at least once", () => {
    const dues = nodes("assessments").map((n) => day(meta(n).due));
    expect(dues.some((d) => ACT_PUBLIC_HOLIDAYS.includes(d))).toBe(true);
  });
});

// --- Structure: workshops, then lectures ------------------------------------------

describe("the teaching structure", () => {
  it("runs one unrecorded workshop a week in the first half, and no lectures", () => {
    for (let week = 1; week <= LAST_WORKSHOP_WEEK; week++) {
      const inWeek = workshops().filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs exactly one workshop`).toHaveLength(1);
      expect(meta(inWeek[0]).recorded, `${inWeek[0].id} must be recorded: false`).toBe(false);
      expect(pageText(inWeek[0].id)).toContain(NOT_RECORDED);
    }
    const early = nodes("lectures").filter((n) => Number(meta(n).week) <= LAST_WORKSHOP_WEEK);
    expect(early.map((n) => n.id), "lectures in the workshop half").toEqual([]);
  });

  it("runs each workshop as one hour, then a two-hour drop-in", () => {
    for (const n of workshops()) {
      const m = meta(n);
      expect(minutes(m.end) - minutes(m.start), `${n.id} contact time`).toBe(WORKSHOP_MINUTES);
      expect(minutes(m.dropInEnd) - minutes(m.end), `${n.id} drop-in`).toBe(DROP_IN_MINUTES);
    }
  });

  it("runs one long, graded lecture a week in the second half", () => {
    for (let week = LAST_WORKSHOP_WEEK + 1; week <= 12; week++) {
      const inWeek = nodes("lectures").filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs exactly one lecture`).toHaveLength(1);
      const m = meta(inWeek[0]);
      expect(m.inLectureAssessment, `${inWeek[0].id} carries no graded component`).toBe(true);
      expect(minutes(m.end) - minutes(m.start), `${inWeek[0].id} is too short`).toBeGreaterThanOrEqual(
        LECTURE_MIN_MINUTES,
      );
    }
  });

  it("moves at least one lecture into a clash with Lab A", () => {
    const clashes = nodes("lectures")
      .filter((l) => meta(l).moved === true)
      .some((l) =>
        labs().some(
          (lab) =>
            day(meta(lab).date) === day(meta(l).date) &&
            minutes(meta(l).start) < minutes(meta(lab).end) &&
            minutes(meta(lab).start) < minutes(meta(l).end),
        ),
      );
    expect(clashes).toBe(true);
  });

  it("gives all twelve weeks a different title", () => {
    const titles = [...workshops(), ...nodes("lectures")].map((n) => n.title);
    expect(titles).toHaveLength(12);
    expect(new Set(titles).size).toBe(12);
  });

  it("links at least one lecture to a real deck", () => {
    const decks = nodes("lectures")
      .map((n) => meta(n).slides)
      .filter((s): s is string => typeof s === "string");
    expect(decks.length).toBeGreaterThan(0);
    for (const slides of decks) {
      expect(existsSync(join(DIST, slides, "index.html")), `${slides} didn't build`).toBe(true);
    }
  });

  it("names all five platforms in the first lecture", () => {
    const first = nodes("lectures").sort((a, b) => Number(meta(a).week) - Number(meta(b).week))[0];
    const text = pageText(first.id);
    for (const platform of PLATFORMS) {
      expect(text, `${first.id} doesn't name ${platform}`).toMatch(new RegExp(`\\b${platform}\\b`));
    }
  });
});

// --- The class summary --------------------------------------------------------

describe("the class summary", () => {
  it("prescribes a long reading list and lists little else", () => {
    const html = pageHtml("class-summary");
    const start = html.indexOf('id="prescribed-texts"');
    expect(start, "no #prescribed-texts section").toBeGreaterThan(-1);
    const next = html.indexOf("<h2", start + 1);
    const section = html.slice(start, next === -1 ? undefined : next);
    expect((section.match(/<li[\s>]/g) ?? []).length).toBeGreaterThanOrEqual(MIN_PRESCRIBED_TEXTS);
    expect((pageText("class-summary").match(/Not listed\./g) ?? []).length).toBeGreaterThanOrEqual(
      MIN_NOT_LISTED,
    );
  });
});

// --- Frozen pages ----------------------------------------------------------------

describe("frozen pages", () => {
  it.skip("leaves the week 9 generated lecture exactly as the author froze it", () => {
    const hash = createHash("sha256").update(readFileSync(FROZEN.path)).digest("hex");
    expect(hash).toBe(FROZEN.sha256);
  });
});
