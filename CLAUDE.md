# Comply (SLOP1961): the harness

## What this course is

**Comply** is a first-year course at Slop University. It is a satrical website based on my worst experienceis with courses at the Australian National University. It is made with massive AI-assistance, especially in the creation of content. Alongside the course itself combining some of the worst pedagogical design elemenents I've seen, each week is a dry topic either exemplefying a broken part of the university, or teaching about a broken part of the university.

This also means the course
contradicts itself, or contradicts the requirements of the assignment, on purpose. Your job is to make sure these contradictions only occur where designed and intended. This document points to contradictions.ts which keeps a log of these intentional contradictions.

The satire is the course design, not in the website's design.

## Voice

- **Deadpan, played straight.** Use a flat institutional register: declarative sentences, policy phrasing, no exclamation marks, no allusions
- **Don't explain  the joke.** The main content must not point out the unreasonableness of a rule, the fact it's contradicotry or unfair. So, if a setance only makes sense as commentary, it should not be there.
- The exception is the week 9 AI-generated lecture website

## Course structure

20% in-lecture assessment
5% assignment 1
15% assignment 2
10% lab assessments
70% final exam

**Weeks 1–6 are workshops**. They are in a workshop tab at the top of the page. There is a section at the top of the workshop page that explains the workshop structure. This means the same explanations need not be on every individual workshop page.
These workshops are never recoreded. This lack-of-recording is reminded to students at the top of each workshop page. This is expressed at the top of the workshop page, stating that "The convenors have a pedagocial dissagreement with recorded content and believe any student who cannot attend should not be enrolled at the university; consequently, we have coded our (crossed out) ~~lectures~~ workshops in a way so they are not required to be recorded. Sue us." 
> The joke: Courses have been known to, in the past, code lectures as "workshops" to avoid the recording requirement in policy.


They are 1-hour long, followed by a 2-hour drop-in session.
> The joke: Tutors have been repeatedly underpaid at ANU by using a structure where associated working time for T21 is used as a "drop-in" time before/after a workshop or lab. Importantly, this time follows workshops previously designed to be 2 or 3 hours long, meaning tutors are effectivley running a longer lab. The tutors are then "blamed" for not cutting the lab short.

The workshop contet is not shared online, and is accessible by attendnace-only. Each workshop page has an "alternative reading" section, which is just a link to a random book.
> The joke: Some convenors have used arbitrary and ridiculous quantities of prior readings to satisfy the "reasonable alternative access" requirements some EAP students require, or as an alternative to recording.

**Weeks 7–12 are lectures**. They are in a seperate lecture tab at the top of the page. There is a section at the top of the lecture page that explains the lecture structure. This means the same explanations need not be on every individual lecture page.
Each lecture entry have a public title and outline (to meet the requiremenst of the assesment, even though most courses don't provide such a summary publically).

In-lecture assessments happen at a random time during each lecture, take about 5 minutes, cannot be doen online, and anyone who doesn't complete it cannot get the marks in alternative ways with no acceptions.

Lectures can get moved in location, time, or delivery form on arbitrary notice. The alternative will be announced in short-notice. If it is a moved lecture, it must still be attended to get the in-lecture assessment marks.
> The joke: this one is self-explanatory and happens in most unis

The lecture is at the same time as one of the 3 availible times for the Labs, wich happen in week 7, 9, 10, and 12. Note that this is not a "clash" because lectures are "clashable" items in ANU's systems. 


- **there is a timetabling page** where each timetanled item is in chronicle order. 
This is more generous that most courses, whcih don't have such a page. It is to make clear intentional choices in timing. Each timetables entry has a start and end time, which makes clear the clashes between activites.

The week-by-week plan is `spec/weeks.md`. Don't edit this file without being explicitly requrested to.

## Contradictions

- A contradiction is intended if is is inside the `spec/contradictions.ts`, which contains the contradiction and the pages it appears on. It also includes the working of the contradiction. The test `spec/comply.test.ts` fails if a registered phrase disappears from the page. This setup is to ensure that an AI that edits a page arbitrarily but does not update its contradiction is held accountable and does not edit crucial parts of the course.
- Do not "fix" registered contradictions.
- If you find a contradiction that is not registered, as the user if it should be fixed or registred.
- When new content contains intentional contradictions, register them

## Facts

- Each fact has one home. Dates, weights, weeks and times live in frontmatter
  or `src/course-config.ts`. Prose refers to the page that owns a fact rather
  than restating it as a literal. A restated literal is how two pages end up
  disagreeing by accident.

## Fiction boundary

- Policy and procedure references use the real ANU procedure number with the prefix `SLOPU_` in place of `ANUP_` (e.g. `SLOPU_018809`, Procedure: Class Summary).
- Never name a real courses at ANU. The only course code allowed anywhere on the site is `SLOPxxxx`. Make a test enforce it. Many rules are drawn from specific real courses, but ensure no detail gets added which explicitly identifies a real course.

## Site

- Keep the starter's look. No restyle, no deliberately bad UX, etc. The course is hostile; the website is not.
- Have a convenor, a co-convenor who is substantially younger, and three tutors for the course: two are masters students who clearly don't care, and one is a bachelor's student who just completed the course last semester.
- The platform is fixed (see `README.md`): the Slop branding, the four
  collection keys, `astro.config.ts`, and the generated API. Don't write
  root-absolute `href="/..."` in `.astro` files; use `withBase`. Markdown
  links are rewritten for you.
- Replacing a starter fragment means removing its `STARTER_CONTENT` comment.
  `pnpm check:evidence` fails while any remain.

## Frozen pages

- The week 9 generated lecture (`src/content/lectures/week-09.md`) is written by an agent with the voice rules switched off, then the author picks which contradictions to keep and they're registered. After that its source is **frozen**: its SHA-256 is recorded in `spec/comply.test.ts` (`FROZEN`), and it is never edited again.
- Other pages will get frozen as developed. This is to ensure they are not edited after I have checked they are complete.

## Working loop

- Run `pnpm check` before every commit. **Commits are green only.**
- Tests for content that doesn't exist yet start as `it.skip`. The change that
  writes the content switches its test on (`it.skip` → `it`) in the same
  commit. Never skip a test to get a commit through.
- Check pages at 1920×1080 and 390×844 before calling visual work done.
- Before accepting generated content, read it as a prospective student would.
  Voice slips get fixed here, as a rule in this file, not only in the chat.

## What this repo has learned (claude can add information here it wishes to store between sessions)

- **Audit before registering.** The first registry pass found an unintended
  contradiction in the agent's own draft: the home page said lectures are
  "where the course is assessed", while two assessments fall in the workshop
  weeks. Summary pages (home, listing intros) paraphrase facts, and
  paraphrases drift. Before registering a week, read its pages and every
  summary that mentions it.
