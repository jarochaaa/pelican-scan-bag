import { ORDER_BAGS, totalBags } from './state';
import type { State } from './state';

/** Figma node holding the task-banner spec (and the flow under test). */
export const TASK_LINK =
  'https://www.figma.com/design/nJFWl2hhYEmIPkDObhIgqO/branch/GYNvj4HV2hDjpS9biD7XSo/Pelican-3.0-Master?node-id=47684-19698&t=x1R1NucUyWioLDul-11';

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
    detail: 'Read the instructions, then start scanning.',
    description: 'What are the 3 steps? What would you do if the shelf is full?',
  },
  location: {
    n: 3,
    detail: 'You are at a shelf. What should you do now?',
    description: 'Use the Scanner button to scan your first bag.',
  },
  bags: {
    n: 4,
    detail: 'Scan 2 bags and place them in this location.',
    description: 'Which bag should you place first? How do you know?',
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
      if (s.locations.length >= 2) return T.nextLocation;
      return bags > 0 ? T.bags : T.location;
    }
  }
}
