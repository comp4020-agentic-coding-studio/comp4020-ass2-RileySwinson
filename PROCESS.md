# Process overview

This course is satirical. The idea is built on my Crit 2 redesign of ANU Programs and Courses, where I also made a satirical page that combines the worst of the courses at ANU.

I got [permission on Ed](https://edstem.org/au/courses/37070/discussion/3549403) to have intentional contradictions in my course, which includes a few deviations from the requirements listed. I registered these contradictions in the harness ([`2e35a92`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/2e35a92)) so the model knows what is and is not written intentionally, and what is in error.

No reasonable student would take this course; however, I believe many students and staff would relate to, understand, and possibly disagree with the criticisms levied against university course design.

AI likes editing many things at once, so I added a concept of a "frozen" page, which uses the page's SHA-256 hash in a [test](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/blob/main/spec/comply.test.ts) to ensure there are no additional changes to that component after I'm happy with it ([`e0c16f5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/e0c16f5), [`a6b4f51`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/a6b4f51)).

The combination of my contradiction tests and my frozen pages means the tests fail if something is "fixed." In other words, because this project was small, had a lot of natural-language edits by AI across multiple pages, and required consistency in its contradictions, this was easier to enforce through an increase in checks on what is intentionally included ([`5e82d17`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/5e82d17)). This is the opposite of how tests usually work, i.e. they pass when something is "fixed."

The required slide deck is in week 9, the generated lecture. It starts with ten slides of quite sound content on the psychology and philosophy of compliance, and quickly goes into a hundred slides of Haiku-generated garbage ([`20806c5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/20806c5)). Students pay less attention past the first few slides anyway.

I had the AI generate a terrible starting point, and iterated towards something better ([`0cc9d15...20806c5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/compare/0cc9d15...20806c5)).

I intentionally avoided directly referencing any courses or situations at ANU, because the intention is not to drag open old wounds. I also chose not to explain the examples/origin of these "bad pedagogical designs" on the website (though some are explained in the CLAUDE.md, [`7d060e1`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/7d060e1)) because it interrupted the flow and felt too meta.

To include more critiques, I split the course into workshops and lectures ([`40e20ca`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/40e20ca)). Some of the important critiques I included here are:

- Inconsistent policy applications
- Arbitrary requirements for medical documentation ([`564259f`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/564259f))
- Blanket rules on failing with late submissions (worsened by the extension rules)
- Arbitrary deductions in assessments
- Large, cohort-wide group assessments ([`8f08b63`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/8f08b63))
- Wage theft by way of "drop-in sessions"
- Incomplete class summaries
- Avoiding lecture recordings by coding them as other types, like workshops
- Including assessed items in clashable course components, such as lectures
- Self-clashing course components, such as a lab with a lecture ([`62026a3`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass2-RileySwinson/commit/62026a3))
- Labs being in seemingly random weeks
- Use of AI in creating courses (somewhat)
- Many others

To be honest, while the motivations and reasons for these critiques are quite justifiable and informed, the fact that most of this content is AI-generated weakens the message.
