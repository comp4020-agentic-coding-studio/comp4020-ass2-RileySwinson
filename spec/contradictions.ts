// The contradiction registry: every place Comply contradicts itself on
// purpose. A contradiction is intended if and only if it is listed here.
// `comply.test.ts` fails if any listed phrase disappears from its page, so
// "fixing" a designed contradiction turns the suite red.
//
// `page` is the page's path in the built site without slashes: a content
// node's id (`lectures/week-07`, `sessions/lab-a`, `assessments/lab-a`), a
// plain page (`policies`, `class-summary`), or "" for the home page.
// `text` is matched against the page's visible text after whitespace and
// typographic quotes are normalised, so quote it exactly as the prose reads.

export interface Claim {
  readonly page: string;
  readonly text: string;
}

export interface Contradiction {
  readonly id: string;
  /** The week whose broken component this contradiction belongs to. */
  readonly week: number;
  /** One line, for the author: which broken part of a university this is. */
  readonly component: string;
  readonly claims: readonly Claim[];
}

// Example of the shape (not live, because the pages don't exist yet):
// {
//   id: "announcements-channel",
//   week: 7,
//   component: "Five platforms, announcements on the one you don't check",
//   claims: [
//     { page: "lectures/week-07", text: "All announcements are made on Teams." },
//     { page: "policies", text: "Announcements are published on Wattle only." },
//   ],
// },
export const contradictions: readonly Contradiction[] = [
  {
    id: "class-summary-authority",
    week: 1,
    component: "The class summary is authoritative, except when it isn't",
    claims: [
      { page: "class-summary", text: "The class summary is the authoritative statement of the course's requirements." },
      { page: "sessions/01-reading-the-class-summary", text: "Where the class summary and the workshop differ, the workshop applies." },
    ],
  },
  {
    id: "examinable-without-exam",
    week: 2,
    component: "Prescribed texts are examinable in a course with no exam",
    claims: [
      { page: "class-summary", text: "All prescribed texts are examinable." },
      { page: "policies", text: "Comply has no final examination." },
    ],
  },
  {
    id: "business-hours-on-a-holiday",
    week: 3,
    component: "Due on a public holiday; submissions only in business hours",
    claims: [
      { page: "assessments/continuous-integrity-assignment", text: "Submissions are accepted during business hours only." },
      { page: "policies", text: "Slop University does not conduct business on public holidays." },
    ],
  },
  {
    id: "drop-in-is-not-teaching",
    week: 4,
    component: "Assessed time that isn't scheduled teaching",
    claims: [
      { page: "sessions/04-associated-working-time", text: "The drop-in session is not scheduled teaching." },
      { page: "assessments/associated-working-time", text: "Associated Working Time is assessed during the drop-in session." },
    ],
  },
  {
    id: "tutor-paid-one-hour",
    week: 4,
    component: "A tutor paid for one hour who works three",
    claims: [
      { page: "people/sam-okafor", text: "Sam is employed for one hour per week." },
      {
        page: "sessions/04-associated-working-time",
        text: "During the drop-in session the tutor supervises the room, assesses Associated Working Time, and answers questions posted to the course forum.",
      },
    ],
  },
  {
    id: "hourly-commits-overnight",
    week: 5,
    component: "Commit every hour; don't study overnight",
    claims: [
      { page: "assessments/continuous-integrity-assignment", text: "A commit must be made in every hour from release to the due time." },
      { page: "policies", text: "Students are not expected to study between 10:00 pm and 7:00 am." },
    ],
  },
  {
    id: "specification-after-due",
    week: 5,
    component: "The assignment is introduced two weeks after it is due",
    claims: [
      { page: "sessions/05-continuous-integrity", text: "The assignment specification is released in this workshop." },
      { page: "sessions/03-the-public-holiday", text: "This workshop is held on the day after the Continuous Integrity Assignment is due." },
    ],
  },
  {
    id: "census-without-marks",
    week: 6,
    component: "Decide at census using marks that arrive after it",
    claims: [
      {
        page: "sessions/06-the-census-date",
        text: "Students should use their marks to decide whether to continue in the course before the census date.",
      },
      { page: "assessments/associated-working-time", text: "Returned: 24 May 2027" },
    ],
  },
  {
    id: "announcements-channel",
    week: 7,
    component: "Five platforms; announcements on two of them",
    claims: [
      { page: "lectures/week-07", text: "All course announcements are made on Teams." },
      { page: "policies", text: "Course announcements are made on Wattle only." },
    ],
  },
  {
    id: "lecture-lab-clash",
    week: 7,
    component: "Compulsory lecture moved onto a compulsory lab",
    claims: [
      { page: "lectures/week-07", text: "Attendance at every lecture is required for the in-lecture assessment." },
      { page: "sessions/lab-a", text: "Attendance at every Lab A session is required." },
    ],
  },
  {
    id: "ai-permitted-and-prohibited",
    week: 8,
    component: "AI allowed in coursework; all coursework is assessment; AI banned in assessment",
    claims: [
      {
        page: "policies",
        text: "Coursework in Comply may be completed with the assistance of generative artificial intelligence.",
      },
      {
        page: "lectures/week-08",
        text: "All coursework in Comply is assessed. Use of generative artificial intelligence in assessment is a breach of academic integrity.",
      },
    ],
  },
  {
    id: "generated-last-weeks-workshop",
    week: 9,
    component: "Generated lecture: refers to a workshop that doesn't exist",
    claims: [
      { page: "lectures/week-09", text: "As discussed in last week's workshop" },
      { page: "sessions/06-the-census-date", text: "This is the final workshop." },
    ],
  },
  {
    id: "generated-45-minutes",
    week: 9,
    component: "Generated lecture: 45 minutes in a three-hour slot",
    claims: [
      { page: "lectures/week-09", text: "This lecture runs for approximately 45 minutes" },
      { page: "timetable", text: "2:00 pm to 5:00 pm Lecture: The Generated Lecture" },
    ],
  },
  {
    id: "generated-no-assessment",
    week: 9,
    component: "Generated lecture: no in-lecture assessment in a lecture that has one",
    claims: [
      { page: "lectures/week-09", text: "there is no in-lecture assessment this week!" },
      { page: "assessments/in-lecture-assessment", text: "An in-lecture assessment is held in every lecture." },
    ],
  },
  {
    id: "generated-final-examination",
    week: 9,
    component: "Generated lecture: assessed in an exam the course doesn't have",
    claims: [
      { page: "lectures/week-09", text: "This week's content will be assessed in the final examination." },
      { page: "policies", text: "Comply has no final examination." },
    ],
  },
  {
    id: "generated-extensions",
    week: 9,
    component: "Generated lecture: cheerful about extensions",
    claims: [
      { page: "lectures/week-09", text: "Remember: extensions are always available if you need them!" },
      { page: "lectures/week-11", text: "No request has yet been found to have merit." },
    ],
  },
  {
    id: "identical-but-additional",
    week: 10,
    component: "Co-badged cohorts assessed identically, except postgraduates",
    claims: [
      { page: "class-summary", text: "Undergraduate and postgraduate students are assessed identically." },
      { page: "lectures/week-10", text: "Postgraduate students complete additional assessment." },
    ],
  },
  {
    id: "review-needs-a-rubric",
    week: 11,
    component: "Appeals must cite the rubric that is never released",
    claims: [
      { page: "policies", text: "Review requests must identify the marking criterion that was misapplied." },
      { page: "assessments/lab-a", text: "Marking criteria are not released." },
    ],
  },
  {
    id: "feedback-after-last-workshop",
    week: 11,
    component: "Feedback in a workshop that no longer runs",
    claims: [
      { page: "policies", text: "Feedback on assessment is provided in the workshop following its return." },
      { page: "sessions/06-the-census-date", text: "This is the final workshop." },
    ],
  },
  {
    id: "every-field-listed",
    week: 12,
    component: "Policy complied with on paper, not enforced",
    claims: [
      { page: "lectures/week-12", text: "The class summary lists every field required by SLOPU_018809." },
      { page: "class-summary", text: "Not listed." },
    ],
  },
];
