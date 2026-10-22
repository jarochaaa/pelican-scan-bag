import { ORDER_BAGS, totalBags } from './state';
import type { State } from './state';

export interface Task {
  /** number shown in the banner's list marker */
  n: number;
  detail: string;
  description: string;
}

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
    description: 'How do you know which bag to place? Tell us what the screen shows you.',
  },
  nextLocation: {
    n: 5,
    detail: 'This shelf is full. Move to a new location with your last bag.',
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

/** The task the tester should be doing on the view they are looking at. */
export function taskFor(s: State): Task {
  if (s.helpOpen) return T.help;
  switch (s.screen) {
    case 'checkout':
      return T.checkout;
    case 'instructions':
      return T.instructions;
    case 'summary':
      return T.summary;
    case 'scan': {
      const bags = totalBags(s.locations);
      if (bags >= ORDER_BAGS.length) return T.finish;
      // 0 bags: first shelf scanned · 1 bag: room for one more · 2+ bags (or a 2nd shelf): shelf is full
      if (s.locations.length >= 2 || bags >= 2) return T.nextLocation;
      return bags === 1 ? T.bags : T.location;
    }
  }
}
