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
/** The week 9 lecture: generated, and exempt from the voice rules and the
 *  outline requirement. */
const GENERATED_LECTURE = "lectures/week-09";
/** Every source file the site is built from, frozen once the author signed
 *  the course off. A file's SHA-256 is recorded here and it is never edited
 *  again (CLAUDE.md, "Frozen pages"). */
const FROZEN = [
  { path: "src/assets/images/card.png", sha256: "26c48945fe0b4b4558f387fa814b8e79368d5fa135200c21a38f9dd9de5a0b91" },
  { path: "src/components/AssessmentSummary.astro", sha256: "8209740c68330c1bd1c45ca15bb5c3aff0bcddcbddcfaecee3360261754d2590" },
  { path: "src/components/AssessmentsGrid.astro", sha256: "36b51a48201fe5633a0e73308de7daf2d4ee0dc8004a4a3d5b5eac2f157e18a8" },
  { path: "src/components/CourseStaff.astro", sha256: "8b1db1d38e5e83248359909acdd2d304a53e445899bcf846dd3ab5eae8f3fc23" },
  { path: "src/components/LecturesGrid.astro", sha256: "94f03432528aabe3136c3d195348be610a2d955a3326116c2feb74c51fe15513" },
  { path: "src/components/MarkingModel.astro", sha256: "fdf1e4acd6e6f9f3eafe5df64910874369a547dd8c5bd16f9731ad84482ce24d" },
  { path: "src/components/PeopleGrid.astro", sha256: "7f38dcfea34451bc533ec41cbe6d1112b90d1ae437a63798c523b6e11f14ba6f" },
  { path: "src/components/ReturnDate.astro", sha256: "7ca01375c6e7b91eb66b99c41365c577b8e7964a11d17ed22e9034f318f77b76" },
  { path: "src/components/SessionsGrid.astro", sha256: "3168a7b3cd7fb5a34a2539a9efa678b40fdeee7133e9fc05283a6938a139cd41" },
  { path: "src/content.config.ts", sha256: "287484ed9af1e6dd1813cbcf790117b8786ef771948b02a2828d5fdf4797a1cf" },
  { path: "src/content/assessments/continuous-integrity-assignment.md", sha256: "7054555a07683f3920f204b0347b34bc48ca2071ee39b0e24b1cb7728a9c6ddf" },
  { path: "src/content/assessments/final-examination.md", sha256: "b2273be58429aed27b51f254667137b952f744bfb2ae9bb4f22382d5ec9d45f5" },
  { path: "src/content/assessments/in-lecture-assessment.md", sha256: "d22ab359e29c62d7f3c41b12963c8063de03658d8d8797d877becea92846e8c5" },
  { path: "src/content/assessments/labs.md", sha256: "009526f4e8bfe77924329d194c1d95f8bcd17c1398d48df150e666980a515fe9" },
  { path: "src/content/assessments/whole-cohort-project.md", sha256: "5e6d083473d95b655d92f9bb438c693294b2495060844b147ae27fe410b3f8f0" },
  { path: "src/content/lectures/week-07.md", sha256: "669d89b7a6b88ff7c58583fbc0c8c65d4101f4425ce0cd0f2e7eea87a32bed2d" },
  { path: "src/content/lectures/week-08.md", sha256: "345cb9807eb8bf738e38ab084652cf7d7d0fbf1aa918e607118bc733a8af6018" },
  { path: "src/content/lectures/week-09.md", sha256: "4f677d58b96ff8abc53086b81dfe51d16613031ede8c1a677ecdbe62b90915b2" },
  { path: "src/content/lectures/week-10.md", sha256: "24b6d64515f57ac33a4f1c9eca25b2789bf66821dbc95560597c0e0f6f294501" },
  { path: "src/content/lectures/week-11.md", sha256: "d8c38298f4b240f8dfc31967b6236771cc465298d9249e0fe12bb2f76134e3b4" },
  { path: "src/content/lectures/week-12.md", sha256: "5fc93478a008222b266cb6fbd1bce34d76bd21ae70e5d82a2c3b0609c664156f" },
  { path: "src/content/people/cornelius-grimm.md", sha256: "d3dc30046a0cb9671d37835971445066cf833eba6a2a7c476516a9341b0c4f18" },
  { path: "src/content/people/ellie-marsh.md", sha256: "385109c67483e98c9c0de56ecdb8d15b3d12df818e4af14e0aa90ae725f1b5f1" },
  { path: "src/content/people/hannah-voss.md", sha256: "6e95ba706775f6e1e9341403fe03b2aabdb5a5b5a2972cc14fcfdc7b146a0a16" },
  { path: "src/content/people/jordan-keel.md", sha256: "05f099f39190e29a8cbc1ee5705aea76424e00ea437ab2042a04aa6272004470" },
  { path: "src/content/people/sam-okafor.md", sha256: "2ac2c9cca54982d38359003458dea0ed70fd9e33787160140829e547cab32f4a" },
  { path: "src/content/sessions/01-reading-the-class-summary.md", sha256: "c701b6dc4d97e83fb114d3ef25ca465a7c89052244eb79a4c13030dc84b0554d" },
  { path: "src/content/sessions/02-prescribed-reading.md", sha256: "ec9f7a4b7d4c5bfdc0f504017f2f40941e55b5321b1326ceb6bfe048096e3719" },
  { path: "src/content/sessions/03-no-content.md", sha256: "72ec595c1c302cec65ccc52d91c700554934e138c324968aeec14fff2f34447a" },
  { path: "src/content/sessions/04-associated-working-time.md", sha256: "4f26a437bacaa420f7c4e7a623ba009ac2b22b5f9ef5ab39eea62db872bcdcec" },
  { path: "src/content/sessions/05-continuous-integrity.md", sha256: "4f8925c66a050d06ab2241a5058b85d0ee003a5e397a0aa578bc7e18bcacb9b4" },
  { path: "src/content/sessions/06-the-census-date.md", sha256: "bf49d7512dafcf58f7b2b36cf2cb46cae74568baec72e9c60676482bd1dad602" },
  { path: "src/content/sessions/lab-07-1.md", sha256: "93f67efbe8283346cc53245df0a9f6d4375702ec7fbf7a960c45a83bd5562c4c" },
  { path: "src/content/sessions/lab-07-2.md", sha256: "b2a1c88ee343ea3535c93726866f8cc725e809b336854d5f70c7bfc31a932a88" },
  { path: "src/content/sessions/lab-07-3.md", sha256: "1c0e3fde8af293aebf3e48e4a28f6081232a9581af4bd508ad08560064ce8133" },
  { path: "src/content/sessions/lab-09-1.md", sha256: "ff6297bb71ef277d08ca6526f4cf341453a03ca01b6c027f79e375432a8e5832" },
  { path: "src/content/sessions/lab-09-2.md", sha256: "b5666758c9e174bfeebf5b229c3b32465f5254fc8b3c2e40482ee670ee5e4bb1" },
  { path: "src/content/sessions/lab-09-3.md", sha256: "45ea5f92ac62a5750fb261021b682e6ef3afb3cda78d5ec7c303cb4dee5b94a5" },
  { path: "src/content/sessions/lab-10-1.md", sha256: "9b751f1830ed2ad92af107ced741c0e5778011d164d818d291ecfb63097e3a75" },
  { path: "src/content/sessions/lab-10-2.md", sha256: "1bca9cbcb816c83c6822795d9d6a21e8a468d20bfb26af4cc468fc1482f1f6fc" },
  { path: "src/content/sessions/lab-10-3.md", sha256: "c0a75d2132e8a8a47a485b570b87ceb2099e22fbaf2c29078c4193dc0af2e6e1" },
  { path: "src/content/sessions/lab-12-1.md", sha256: "a208db5f2abf644ef37e8326a1a6b1e0a5708dfd7e7191476b33c1ad1e596531" },
  { path: "src/content/sessions/lab-12-2.md", sha256: "5dd9dfc474efbc30cd81d8109f4bd82b0d085bcb9f71712411d81fe3a208c7c8" },
  { path: "src/content/sessions/lab-12-3.md", sha256: "73166e7efd9edbabde96ff050355ff70679791a3fb85c966df69ff8cebc74244" },
  { path: "src/course-config.ts", sha256: "426466cde08f0d60fe5836a92373ec41cb3ded94911356bcd7f50fa93fb7a96b" },
  { path: "src/decks/theme.css", sha256: "6857acabe9ad271c407dba4eba9a33167c76395851e436f421bd2074a7ef68ca" },
  { path: "src/decks/week-07.deck.mdx", sha256: "421f784282ef091eae7cfa9c25293a5c11cce0d8e0295d18cab5d9997322f92f" },
  { path: "src/decks/week-09.deck.mdx", sha256: "8bc7a9b6ef2b5b85177de3b281ca3557be7519687ffb6f2178d31860ab2b3d07" },
  { path: "src/layouts/PageLayout.astro", sha256: "d79cffd8213f4787bab8d5cd7b5fd90309e1872f796d955ee4575f363bc65687" },
  { path: "src/lib/dates.ts", sha256: "865ad6497540163149eb349889dfc112245a944c85efecfd2728de91823450e4" },
  { path: "src/pages/404.md", sha256: "30c1d82f05ef4c77e15d84bff9913ee9b9fc6c3b6443f9d8cdfad2fd616156c3" },
  { path: "src/pages/assessments/[slug].astro", sha256: "4bfb856b5aff3299996d3e72b8d4ce9dd31b057442045ca7f756c5625150d78d" },
  { path: "src/pages/assessments/index.mdx", sha256: "942e162bbcd0525ae7f224effce189b790a9df8b79039436d5f45f0b73fbe081" },
  { path: "src/pages/class-summary/index.mdx", sha256: "080258c8ef00f60e813be77491949c572a0269d6fcb9bafed1fcd0fd89292e72" },
  { path: "src/pages/index.astro", sha256: "04501dbd7ffefbd1f4b1037d6b852b887e5750e7c50f0be51d5acfef7db4af0f" },
  { path: "src/pages/lectures/[slug].astro", sha256: "ad1502f197d4ab9ff704970f2e2e51431888303527e62f078a6767b5343645d6" },
  { path: "src/pages/lectures/index.mdx", sha256: "22d1cb76b4f3a655eca94c12ce52693b0506667874abe50cf3c031a0cfff5b1f" },
  { path: "src/pages/people/[slug].astro", sha256: "cd9d701e9bdf3f602e7b97f1cf74ce88a81859c40660509cef94c54430001c21" },
  { path: "src/pages/people/index.mdx", sha256: "c83fb8e727b00cf2d4bbd42f9246692640caf6dea3458f6a14d9777c53080393" },
  { path: "src/pages/policies/index.mdx", sha256: "3228465057b63f93a11e1515163a4c48e0654b825f7e11bbc40d61106830a5ae" },
  { path: "src/pages/sessions/[slug].astro", sha256: "9845031b8ee836392b65fa20b97344de6ffd4344a1fdaf95fd533798a79ede64" },
  { path: "src/pages/sessions/index.astro", sha256: "be2e3aacb4b0b5cce994434b116ea77d9b30909c9112f9a6988eeb1b3f3ddb9a" },
  { path: "src/pages/timetable/index.astro", sha256: "2b2f90833071329415c680cbb70dc77fae12718250718123cb8b9dfb4ea6e3b6" },
  { path: "src/site-config.ts", sha256: "12b1247db5d5722acbd16a1465fe1626a92dd4d0f491784b9dc598972d067e5b" },
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

  it("states on the workshops page why workshops are not recorded", () => {
    const html = pageHtml("sessions");
    expect(pageText("sessions")).toContain(NO_RECORDING_NOTICE);
    expect(html, "\"lectures\" must be struck out").toMatch(/<(del|s)>\s*lectures\s*<\/\1>/);
  });

  it("offers an alternative reading, and no content, on each workshop page", () => {
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

  it("gives every lecture but the generated one a public outline", () => {
    for (const n of nodes("lectures").filter((l) => l.id !== GENERATED_LECTURE)) {
      expect(pageHtml(n.id), `${n.id} has no #outline section`).toContain('id="outline"');
    }
  });

  it("moves at least one lecture", () => {
    expect(nodes("lectures").some((l) => meta(l).moved === true)).toBe(true);
  });

  it("puts a lecture at the same time as a lab", () => {
    expect(nodes("lectures").some((l) => labs().some((lab) => overlaps(l, lab)))).toBe(true);
  });

  it("runs labs at three times a week, in the lab weeks only", () => {
    expect([...new Set(labs().map((n) => Number(meta(n).week)))].sort((a, b) => a - b)).toEqual(LAB_WEEKS);
    for (const week of LAB_WEEKS) {
      const inWeek = labs().filter((n) => meta(n).week === week);
      expect(inWeek, `week ${week} needs ${LAB_TIMES} lab times`).toHaveLength(LAB_TIMES);
    }
  });

  it("puts every lab-week lecture at the same time as one of that week's labs", () => {
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
