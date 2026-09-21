# Process overview

<!-- TEMPLATE: draft written by Claude from the commit history and our
     decision rounds. PROCESS.md must be your own account: rewrite it in your
     own words, add the Ed thread link, then delete this comment. -->

## What I built

**Comply** (SLOP1961) is a first-year course in which each week teaches one
broken part of a university as if it were a discipline, and the course then does
that thing to the student: an assignment due at noon on Canberra Day, a
compulsory lecture moved onto a compulsory 50% lab, a tutor paid for one of the
three hours they work, a rubric that is never released but must be cited in any
appeal. It is played entirely straight.

## How I got here

The brief asks for twenty-odd pages that agree with each other. A satirical
course has to *disagree* with itself, so before building I asked the convenor
whether designed contradictions were acceptable. His answer set the spine of
the harness: enforce the incoherence rather than the coherence. My position on
a good course, taken from *Calling Bullshit*, is one point of view held for a
whole semester. For a course like this one, that means every contradiction has
to be deliberate. An agent produces contradictions for free, and mine only work
if they're distinguishable from the ones it produces by accident.

So the harness splits coherence into two layers. Facts (dates, weights, times)
agree everywhere and have one home in frontmatter. Contradictions exist only if
registered, and CLAUDE.md tells the agent to stop and ask me about any
unregistered one rather than fix or keep it
([`208ab8c`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/208ab8c)). The registry and its tests came before any
content ([`2e35a92`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/2e35a92)). Most of the tests fail when something
gets *fixed*: the rubric test fails if an assessment publishes marking criteria,
the clash test fails if the moved lecture no longer overlaps Lab A, and the
public-holiday test fails if the due date moves off Canberra Day.

I made the structural calls in rounds of decisions: pure deadpan with no joke
explained, SLOPU_ numbers mirroring the real ANUP_ procedures, and workshops
(unrecorded, where the real content lives) in weeks 1 to 6 with long graded
lectures in weeks 7 to 12. The draft switched on ten tests in the same commit
as the content they check ([`00238f1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/00238f1)).

Registering the contradictions ([`77cb7d5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/77cb7d5)) caught one I
hadn't designed. The home page said lectures are where the course is assessed,
but two assessments fall in the workshop weeks. It was a paraphrase that had
drifted, not a joke, so it was fixed and became a rule in CLAUDE.md rather than
being registered.

Week 9 is the one page exempt from the voice rules: a lecture that is visibly
generated. I committed the raw output untouched
([`5f8aa45`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/5f8aa45)), then trimmed it
([`5f8aa45...60c8efd`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/compare/5f8aa45...60c8efd)), keeping only the
contradictions that collide with another page (the absent exam, the three-hour
slot, the in-lecture assessment) and cutting the ones that contradict only
themselves, which read as ordinary slop. Then I froze it with a hash test
([`e0c16f5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/e0c16f5)), so that a later "tidy this up" can't fix
the joke.

## What I left out

- **Bad UX.** The course is hostile; the site is not. Axe stays at zero, and
  all 30 pages were checked for overflow at 390×844 and 1920×1080.
- **Identifiable targets.** Many rules come from specific real courses. A test
  rejects any course code but SLOP, and ANU is named only on the About page.
- **Restyling and imagery.** A plain official site suits deadpan.

## How I knew it was right

Green checks prove the contradictions are still in place, not that they're
funny, so I read each week as a student would, alongside the pages it
contradicts.
