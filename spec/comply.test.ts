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

/** Weeks 1..LAST_WORKSHOP_WEEK are workshops; the rest are lectures. Week 3
 *  has no workshop. */
const LAST_WORKSHOP_WEEK = 6;
const WORKSHOP_WEEKS = [1, 2, 4, 5, 6];
/** Labs run in these weeks only, at LAB_TIMES different times each week. */
const LAB_WEEKS = [7, 9, 10, 12];
const LAB_TIMES = 3;
/** The workshops page states why nothing is recorded, with "lectures"
 *  struck out in favour of "workshops". */
const NO_RECORDING_NOTICE =
  "The convenors have a pedagogical disagreement with recorded content and believe any student who cannot attend should not be enrolled at the university; consequently, we have coded our lectures workshops in a way so they are not required to be recorded. Sue us.";
/** Teaching staff, by the `role:` in each person's frontmatter. */
const STAFF = { convenor: 1, "co-convenor": 1, tutor: 3 };
/** A workshop is one hour of contact followed by a two-hour drop-in. */
const WORKSHOP_MINUTES = 60;
const DROP_IN_MINUTES = 120;
/** Census date for the 2027 Semester 1 teaching period. */
const CENSUS = "2027-03-31";
/** ACT public holidays inside the teaching period (Canberra Day, Good
 *  Friday, Easter Monday). */
const ACT_PUBLIC_HOLIDAYS = ["2027-03-08", "2027-03-26", "2027-03-29"];
const NOT_RECORDED = "This workshop is not recorded.";
const NO_CONTENT = "No content this week.";
const NO_RUBRIC = "Marking criteria are not released.";
const PLATFORMS = ["Wattle", "Canvas", "Ed", "Teams", "email"];
const MIN_PRESCRIBED_TEXTS = 20;
const MIN_NOT_LISTED = 10;
/** Pages the author has checked and frozen. A page is added here, with the
 *  SHA-256 of its source, once the author signs it off (CLAUDE.md, "Frozen
 *  pages"). */
const FROZEN = [
  {
    path: "src/content/lectures/week-09.md",
    sha256: "c3480de142a8ae561c60041cc35debbacafaf0d75d987b356d908aa31250dc21",
  },
];

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

const workshops = () => nodes("sessions").filter((n) => meta(n).kind === undefined);
const breaks = () => nodes("sessions").filter((n) => meta(n).kind === "break");
const labs = () => nodes("sessions").filter((n) => meta(n).kind === "lab");
/** Same day, overlapping times. */
const overlaps = (a: ApiNode, b: ApiNode) =>
  day(meta(a).date) === day(meta(b).date) &&
  minutes(meta(a).start) < minutes(meta(b).end) &&
  minutes(meta(b).start) < minutes(meta(a).end);

// --- Designed incoherence ---------------------------------------------------

describe("the contradiction registry", () => {
  it("places every contradiction on two pages, or on one page against the brief", () => {
    for (const c of contradictions) {
      const pages = new Set(c.claims.map((claim) => claim.page));
      expect(pages.size, `${c.id} names no page`).toBeGreaterThanOrEqual(1);
      if (pages.size < 2) {
        expect(c.against, `${c.id} needs a second page or an \`against\` requirement`).toBeTruthy();
      }
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
  it("runs one unrecorded workshop in each workshop week, and no lectures", () => {
    expect([...new Set(workshops().map((n) => Number(meta(n).week)))].sort((a, b) => a - b)).toEqual(
      WORKSHOP_WEEKS,
    );
    for (const week of WORKSHOP_WEEKS) {
      const inWeek = workshops().filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs exactly one workshop`).toHaveLength(1);
      expect(meta(inWeek[0]).recorded, `${inWeek[0].id} must be recorded: false`).toBe(false);
      expect(pageText(inWeek[0].id)).toContain(NOT_RECORDED);
    }
    const early = nodes("lectures").filter((n) => Number(meta(n).week) <= LAST_WORKSHOP_WEEK);
    expect(early.map((n) => n.id), "lectures in the workshop half").toEqual([]);
  });

  it.skip("states on the workshops page why workshops are not recorded", () => {
    const html = pageHtml("sessions");
    expect(pageText("sessions")).toContain(NO_RECORDING_NOTICE);
    expect(html, "\"lectures\" must be struck out").toMatch(/<(del|s)>\s*lectures\s*<\/\1>/);
  });

  it.skip("offers an alternative reading, and no content, on each workshop page", () => {
    for (const n of workshops()) {
      const html = pageHtml(n.id);
      const start = html.indexOf('id="alternative-reading"');
      expect(start, `${n.id} has no #alternative-reading section`).toBeGreaterThan(-1);
      const next = html.indexOf("<h2", start + 1);
      const section = html.slice(start, next === -1 ? undefined : next);
      expect(section, `${n.id}'s alternative reading links nothing`).toMatch(/<a [^>]*href="https?:/);
    }
  });

  it("states that each week without a workshop has no content", () => {
    const empty = Array.from({ length: LAST_WORKSHOP_WEEK }, (_, i) => i + 1).filter(
      (week) => !WORKSHOP_WEEKS.includes(week),
    );
    for (const week of empty) {
      const inWeek = breaks().filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs a page saying it has no content`).toHaveLength(1);
      expect(pageText(inWeek[0].id)).toContain(NO_CONTENT);
    }
  });

  it("runs each workshop as one hour, then a two-hour drop-in", () => {
    for (const n of workshops()) {
      const m = meta(n);
      expect(minutes(m.end) - minutes(m.start), `${n.id} contact time`).toBe(WORKSHOP_MINUTES);
      expect(minutes(m.dropInEnd) - minutes(m.end), `${n.id} drop-in`).toBe(DROP_IN_MINUTES);
    }
  });

  it("runs one lecture with an in-lecture assessment a week in the second half", () => {
    for (let week = LAST_WORKSHOP_WEEK + 1; week <= 12; week++) {
      const inWeek = nodes("lectures").filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs exactly one lecture`).toHaveLength(1);
      expect(meta(inWeek[0]).inLectureAssessment, `${inWeek[0].id} carries no graded component`).toBe(true);
    }
  });

  it.skip("gives every lecture a public outline", () => {
    for (const n of nodes("lectures")) {
      expect(pageHtml(n.id), `${n.id} has no #outline section`).toContain('id="outline"');
    }
  });

  it("moves at least one lecture", () => {
    expect(nodes("lectures").some((l) => meta(l).moved === true)).toBe(true);
  });

  it.skip("puts a lecture at the same time as a lab", () => {
    expect(nodes("lectures").some((l) => labs().some((lab) => overlaps(l, lab)))).toBe(true);
  });

  it.skip("runs labs at three times a week, in the lab weeks only", () => {
    expect([...new Set(labs().map((n) => Number(meta(n).week)))].sort((a, b) => a - b)).toEqual(LAB_WEEKS);
    for (const week of LAB_WEEKS) {
      const inWeek = labs().filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs ${LAB_TIMES} lab times`).toHaveLength(LAB_TIMES);
    }
  });

  it.skip("puts every lab-week lecture at the same time as one of that week's labs", () => {
    for (const l of nodes("lectures").filter((n) => LAB_WEEKS.includes(Number(meta(n).week)))) {
      const same = labs().filter((lab) => overlaps(l, lab));
      expect(same, `${l.id} shares no time with a lab`).toHaveLength(1);
    }
  });

  it("gives every timetabled entry a start and end time", () => {
    for (const n of [...workshops(), ...labs(), ...nodes("lectures")]) {
      expect(minutes(meta(n).end) > minutes(meta(n).start), `${n.id} ends before it starts`).toBe(true);
    }
  });

  it("lists the timetable in chronological order, every row timed", () => {
    const body = pageHtml("timetable").match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? "";
    const rows = [...body.matchAll(/<tr[\s>][\s\S]*?<\/tr>/g)].map((r) =>
      [...r[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => visibleText(c[1])),
    );
    expect(rows.length).toBeGreaterThan(0);
    const weeks = rows.map((r) => Number(r[0]));
    expect(weeks, "rows out of week order").toEqual([...weeks].sort((a, b) => a - b));
    for (const r of rows) expect(r[2], `untimed row: ${r[3]}`).not.toBe("Not listed.");
  });

  it("gives every teaching week a different title", () => {
    const titles = [...workshops(), ...nodes("lectures")].map((n) => n.title);
    const weeks = WORKSHOP_WEEKS.length + (12 - LAST_WORKSHOP_WEEK);
    expect(titles).toHaveLength(weeks);
    expect(new Set(titles).size).toBe(weeks);
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
  it("leaves every frozen page exactly as the author froze it", () => {
    for (const { path, sha256 } of FROZEN) {
      const hash = createHash("sha256").update(readFileSync(path)).digest("hex");
      expect(hash, `${path} changed after it was frozen`).toBe(sha256);
    }
  });
});

// --- Staff -------------------------------------------------------------------------

describe("the teaching staff", () => {
  it("has a convenor, a co-convenor and three tutors", () => {
    const people = nodes("people");
    for (const [role, count] of Object.entries(STAFF)) {
      const holders = people.filter((n) => meta(n).role === role);
      expect(holders, `expected ${count} ${role}`).toHaveLength(count);
    }
  });
});
