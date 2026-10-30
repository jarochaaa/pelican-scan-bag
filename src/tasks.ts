import { ORDER_BAGS, totalBags } from './state';
import type { State } from './state';

export interface Task {
  /** number shown in the banner's list marker (omitted on the closing message) */
  n?: number;
  /** optional bold lead-in before the detail (used to orient the tester after a jump back) */
  title?: string;
  detail: string;
  /** optional second line; omit when the task needs no extra prompt */
  description?: string;
}

/**
 * Switch for the orange task strip on top of the app. `false`: the app is just the dark view and the
 * facilitator hints replace the strip. Set to `true` to bring it back (taskFor() below keeps working either way).
 */
export const SHOW_TASK_BANNER = false;

const T = {
  checkout: {
    n: 1,
    detail: 'You just finished picking order #123. Continue to pack it.',
    description: 'Tell us out loud what you expect to happen next.',
  },
  instructions: {
    n: 2,
    detail: 'Scan a location with empty space.',
    description: 'Use the Scanner button to scan a shelf that has room for your bags.',
  },
  location: {
    n: 3,
    detail: 'You are at a shelf. What should you do now?',
    description: 'Use the Scanner button to scan your first bag.',
  },
  bags: {
    n: 4,
    detail: 'There is room for one more bag in this location. Scan the second of your 3 bags and place it here.',
  },
  nextLocation: {
    n: 5,
    detail: 'This shelf is full and 1 bag is still left to scan. Move to a new location with your last bag.',
    description: 'Scan the new shelf, then the remaining bag.',
  },
  help: {
    n: 7,
    detail: 'You found the instructions again. Close Help and keep scanning.',
    description: 'Was this what you were looking for?',
  },
  finish: {
    n: 8,
    detail: 'All 3 bags are placed. Finish the task.',
    description: 'What do you expect to happen after Finish?',
  },
  summary: {
    n: 8,
    detail: 'Check the summary and complete the task.',
    description: 'Where did each bag go and who picks them up?',
  },
} satisfies Record<string, Task>;

/** Follow-up tasks that run after step 8 (Summary → Done), back on the full scan screen. */
const EXTRAS = {
  select: {
    n: 9,
    title: "Let's go back a bit.",
    detail: 'You want to check the other location. How would you select it?',
    description: 'Show us what you would do.',
  },
  delete: {
    n: 10,
    detail: 'Now remove one of the locations, even though all the bags are placed. How would you delete it?',
    description: 'Is sliding something you usually do to delete things? Tell us.',
  },
  end: {
    detail: 'That was the last task. Thank you!',
    description: 'Tap Finish and then Ready for Pickup to start again.',
  },
} satisfies Record<NonNullable<State['extras']>, Task>;

/** The task the tester should be doing on the view they are looking at. */
export function taskFor(s: State): Task {
  if (s.extras) return EXTRAS[s.extras];
  if (s.helpOpen) return T.help;
  switch (s.screen) {
    case 'checkout':
      return T.checkout;
    case 'instructions':
      return T.instructions;
    case 'summary':
      return T.summary;
    case 'dispatch':
      // today's flow (version switch): no test tasks written for it
      return { detail: 'Task detail', description: 'Task short description' };
    case 'scan': {
      const bags = totalBags(s.locations);
      if (bags >= ORDER_BAGS.length) return T.finish;
      // 0 bags: first shelf scanned · 1 bag: room for one more · 2+ bags (or a 2nd shelf): shelf is full
      if (s.locations.length >= 2 || bags >= 2) return T.nextLocation;
      return bags === 1 ? T.bags : T.location;
    }
  }
}
