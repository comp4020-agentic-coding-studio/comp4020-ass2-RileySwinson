# Comply (SLOP1961): the harness

## What this course is

**Comply** is a first-year course at Slop University. Each week teaches one
broken part of a university as if it were a legitimate discipline, and the
course does that same thing to the student somewhere on the site. The course
contradicts itself on purpose. Your job is to make sure that it contradicts
itself **only where it was designed to**.

This is satire of real university practice, delivered as a real course website.
The satire lives in the course's rules and prose, never in the site's usability.

## Voice

- **Deadpan, and played straight everywhere.** Use a flat institutional
  register: declarative sentences, policy phrasing, no exclamation marks, no
  winking, no scare quotes, no adjectives that editorialise ("absurd",
  "Kafkaesque", "hilariously").
- **Never explain a joke.** No sentence may point out that a rule is
  unreasonable, contradictory or unfair. If a sentence only makes sense as
  commentary, delete it. Any explanation layer is the author's to add later,
  and only on the About page.
- The one exception is the week 9 generated lecture (see "Frozen pages").

## Course structure (fixed)

- **Weeks 1–6 are workshops**, as `sessions` entries shown to students as
  "Workshops". They are **never recorded**. Each workshop states that on its
  page, carries `recorded: false` in frontmatter, and runs as a 1-hour
  workshop followed by a 2-hour drop-in session. Workshops hold the content
  a student actually needs. No lectures run in weeks 1–6.
- **Weeks 7–12 are lectures**, as `lectures` entries. They are long and cover
  nothing a student needs, but each one carries a graded in-lecture
  component (`inLectureAssessment: true`). Lectures get moved (`moved: true`)
  into slots that clash with the Lab A stream (a `sessions` entry with
  `kind: lab`, weeks 7–12).
- Every timetabled entry carries `start:` and `end:` (24-hour `"HH:MM"`,
  Canberra time) alongside its `date:`, so clashes are facts, not prose.
- Twelve weeks, one broken component per week, and no two weeks share a joke.
  The week-by-week plan is `design/inventory.md`, which the author owns: don't
  add, drop or swap a week's component without asking.

## Contradictions

- A contradiction is intended **if and only if** it is registered in
  `spec/contradictions.ts`, with its exact phrases and the pages they appear
  on. `spec/comply.test.ts` fails if a registered phrase disappears from its
  page.
- **Never resolve a registered contradiction**, however much it looks like a
  mistake. That's the design.
- **If you find a contradiction that isn't registered, stop and ask the
  author** whether to fix it or register it. Don't decide either way yourself.
- When content that carries a planned contradiction is written, register it in
  the same change.

## Facts

- Each fact has one home. Dates, weights, weeks and times live in frontmatter
  or `src/course-config.ts`. Prose refers to the page that owns a fact rather
  than restating it as a literal. A restated literal is how two pages end up
  disagreeing by accident.

## Fiction boundary

- The institution is Slop University. Policy and procedure references use the
  real ANU procedure number with the prefix `SLOPU_` in place of `ANUP_` (e.g.
  `SLOPU_018809`, Procedure: Class Summary).
- Never name a real course. The only course code allowed anywhere on the site is
  `SLOPxxxx`, and a test enforces it. Many rules are drawn from specific real
  courses. Never add detail that identifies one.
- "ANU" / "Australian National University" appears only on the About page, if
  at all. A test enforces it.

## Site

- Keep the starter's look. No restyle, no deliberately bad UX, and axe stays at
  zero violations. The course is hostile; the website is not.
- Image-free: the starter images are deleted, not replaced. Staff pages don't
  use photographs.
- Teaching sessions are labelled "Workshops" (`sessionLabels`); the collection
  key and URLs stay `sessions`.
- The platform is fixed (see `README.md`): the Slop branding, the four
  collection keys, `astro.config.ts`, and the generated API. Don't write
  root-absolute `href="/..."` in `.astro` files; use `withBase`. Markdown
  links are rewritten for you.
- Replacing a starter fragment means removing its `STARTER_CONTENT` comment.
  `pnpm check:evidence` fails while any remain.

## Frozen pages

- The week 9 generated lecture (`src/content/lectures/week-09.md`) is written
  by an agent with the voice rules switched off, then the author picks which
  contradictions to keep and they're registered. After that its source is **frozen**: its SHA-256 is recorded in
  `spec/comply.test.ts` (`FROZEN`), and it is never edited again. If a change
  seems necessary, ask.

## Working loop

- Run `pnpm check` before every commit. **Commits are green only.**
- Tests for content that doesn't exist yet start as `it.skip`. The change that
  writes the content switches its test on (`it.skip` → `it`) in the same
  commit. Never skip a test to get a commit through.
- Check pages at 1920×1080 and 390×844 before calling visual work done.
- Before accepting generated content, read it as a prospective student would.
  Voice slips get fixed here, as a rule in this file, not only in the chat.

## What this repo has learned

(Add an entry each time the agent gets something wrong and the fix is a rule or
a test.)
