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
export const contradictions: readonly Contradiction[] = [];
