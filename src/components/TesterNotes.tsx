import { ORDER_BAGS, totalBags } from '../state';
import type { State } from '../state';

/** How to recreate the edge cases on purpose (for the facilitator). One recipe per EDGE CASE row of the navigator. */
const EDGE_CASES: { title: string; steps: string[] }[] = [
  {
    title: 'Wrong or duplicate bag',
    steps: ['The simulated scanner always scans a valid bag, so these cannot be triggered by tapping.', 'Jump to E1 (wrong bag: it belongs to another order) or E3 (bag already scanned) in the left panel.'],
  },
  {
    title: 'Finish before scanning a location',
    steps: ['On Instructions (B1) tap “Scan Bag” first: a yellow location with the bag and no shelf opens (C7). Finish stays disabled.', 'The alert “Scan a location first” (E2) can only be opened from the left panel now.', 'Tap “Scan Location”: the shelf is assigned to those bags and the location turns selected (green).'],
  },
  {
    title: 'Empty location blocks the flow',
    steps: ['Tap “Scan Location”: a location opens with 0 bags (C1).', 'Tap “Scan Location” again: the alert “Location open and empty” appears (E4) and nothing is added.', 'To get an empty location next to one with bags: scan a bag, then “Scan Location” (C4), then “Finish”. The alert “A location has no bags” appears (E5).', 'Either add bags to it or delete it to continue.'],
  },
  {
    title: 'Delete a bag or a location',
    steps: ['Bag: tap the bin icon on its card.', 'Empty location: use the red “Delete location” text button under the scan hint.', 'Location with bags: slide it to the left (right in Arabic). Release past the red area to keep it open and tap the bin, or slide all the way to delete it.'],
  },
  {
    title: 'No more shelves',
    steps: ['The simulated scanner has 4 shelf locations. Scan a bag in each one before scanning the next location.', 'On the fifth “Scan Location” the warning “Location already scanned” appears (E6).'],
  },
  {
    title: 'Back resets the scanning',
    steps: ['On the scanning screen tap the back arrow: you land on Instructions (B1) with no locations or bags kept.'],
  },
];

const bagsOrder = ORDER_BAGS.join(', ');

/** Desktop-only side box: what to do on the current view (a hint for the facilitator). A pure function of (state, code). */
export function TesterNotes({ s, code }: { s: State; code: string }) {
  let title = 'Facilitator hints';
  const lines: string[] = [];
  const bags = totalBags(s.locations);

  switch (code) {
    case 'A1':
      title = 'Checkout done view';
      lines.push('The picker has just finished picking order #123: three products under “Picked”.');
      lines.push('“Continue checkout” goes to Instructions (B1). The back arrow does nothing in the prototype.');
      break;
    case 'B1':
      title = 'Instructions';
      lines.push('Illustration, one instruction (“Scan a location or bag QR code to start”) and a warning about what to do when a shelf is full.');
      lines.push('The picker can start either way: “Scan Location” opens the first shelf (C1); “Scan Bag” opens a location without shelf holding that bag (C7).');
      break;
    case 'B2':
      title = 'Help';
      lines.push('The same instructions, opened from the “?” icon of the scanning screen.');
      lines.push('The X closes it and returns to where the picker was.');
      break;
    case 'C1':
      title = 'Location scanned · no bags yet';
      lines.push('The selected location is open with 0 bags and the message “Scan bags to add in this location”.');
      lines.push(`“Scan Bag” adds the next bag of the order (${bagsOrder}). Finish stays disabled until there is one.`);
      lines.push('“Delete location” removes the empty location.');
      break;
    case 'C7':
      title = 'Bag scanned first · no location yet';
      lines.push('Yellow frame: the bags are waiting for a shelf. Location shows “-”.');
      lines.push('“Scan Bag” keeps adding bags to it. “Scan Location” assigns the shelf and the location turns selected (green, C2/C3).');
      lines.push('Finish is disabled until a location is scanned.');
      break;
    case 'C2':
    case 'C3':
      title = `${bags} bag${bags === 1 ? '' : 's'} in the location`;
      lines.push(`Order #123 has 3 bags (${bagsOrder}). Each “Scan Bag” adds the next one at the top of the selected location.`);
      lines.push('There is no limit per location. After the 3 bags of the order, extra bags get generated codes (4001, 4002…).');
      lines.push('“Scan Location” opens a new location (C4). Finish enabled: it goes to the summary (D1).');
      break;
    case 'C4':
      title = 'New location open and empty';
      lines.push('The new location is selected and the previous one collapses under it.');
      lines.push('Scanning another location now shows E4; Finish now shows E5.');
      lines.push('Tap a collapsed location to select it again (C5).');
      break;
    case 'C5':
      title = 'Back on an earlier location';
      lines.push('The location the picker tapped is selected: “Scan Bag” adds to it.');
      lines.push('Slide a location with bags to delete it.');
      break;
    case 'C6':
      title = 'Bags spread across locations';
      lines.push('Each location keeps its own bags. Finish goes to the summary (D1).');
      break;
    case 'D1':
      title = 'Summary';
      lines.push('Order completed, counters, product status, rider handoff and one card per location (read only).');
      lines.push('“Ready for Pickup” sends the data to the Rider App and returns to scanning for the follow-up views (F1 or F2).');
      break;
    case 'F1':
      title = 'After the summary · select a location';
      lines.push('Back on the scanning screen with every location full.');
      lines.push('Ask how the picker would select the other location: tapping it moves to F2.');
      break;
    case 'F2':
      title = 'After the summary · delete a location';
      lines.push('Ask how the picker would remove a location even though every bag is placed.');
      lines.push('Note whether they try sliding it. Deleting a location moves to F3.');
      break;
    case 'F3':
      title = 'End of the test';
      lines.push('Nothing else to do. Finish and Ready for Pickup restart the prototype.');
      break;
    case 'G1':
      title = 'Current version · Scan Location';
      lines.push('Today’s flow, opened over Confirm Order Dispatch after “Continue checkout”.');
      lines.push('Tap the orange scan button: it simulates a successful location scan and fills “Location Number” (G2).');
      lines.push('Close goes to Confirm Order Dispatch without adding anything.');
      break;
    case 'G2':
      title = 'Current version · Location scanned';
      lines.push('Add opens Number of Bags (G3) for that location.');
      break;
    case 'G3':
      title = 'Current version · Number of Bags';
      lines.push('Set how many bags go on that location with − / +, then Add.');
      lines.push('The location and its bag count land on Confirm Order Dispatch (G4).');
      break;
    case 'G4':
      title = 'Current version · Confirm Order Dispatch';
      lines.push('Total Number of Bags adds up every dispatch location.');
      lines.push('The green + repeats Scan Location → Number of Bags for another location.');
      lines.push('Confirm Dispatch restarts the prototype.');
      break;
    case 'G5':
      title = 'Current version · no dispatch location';
      lines.push('The Scan Location sheet was closed without adding a location. Confirm Dispatch is disabled; tap the green + to add one.');
      break;
    case 'E1':
      title = 'Alert · Wrong bag';
      lines.push('The scanned bag belongs to another order. The alert closes by itself or when tapped.');
      lines.push('Cannot be triggered by tapping: use the left panel.');
      break;
    case 'E2':
      title = 'Alert · Scan a location first';
      lines.push('Shown if Finish is reached while bags are still waiting for a shelf. Finish is disabled in C7, so open it from the left panel.');
      lines.push('Tap “Scan Location” to assign the shelf and continue.');
      break;
    case 'E3':
      title = 'Warning · Bag already scanned';
      lines.push('The same bag scanned twice. Cannot be triggered by tapping: use the left panel.');
      break;
    case 'E4':
      title = 'Alert · Location open and empty';
      lines.push('A location is open with 0 bags and a new location was scanned.');
      lines.push('Add bags with “Scan Bag” or delete the empty location.');
      break;
    case 'E5':
      title = 'Alert · A location has no bags';
      lines.push('Finish was tapped while a location had 0 bags.');
      lines.push('Add bags to it or delete it, then Finish again.');
      break;
    case 'E6':
      title = 'Warning · Location already scanned';
      lines.push('All 4 shelf locations of the simulation have been used.');
      break;
    default:
      lines.push('Unknown alert.');
  }

  const openEdge = ['B1', 'C7', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'].includes(code);

  return (
    <aside className="tester-notes" aria-label="Facilitator hints">
      <div className="tester-notes__tag">Facilitator hints · view {code}</div>
      <h2>{title}</h2>
      <ul>
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
      {s.version === 'new' && (
      <details className="edge" open={openEdge}>
        <summary>Edge cases · how to recreate them</summary>
        {EDGE_CASES.map((e, i) => (
          <div key={e.title} className="edge__case">
            <h3>
              {i + 1}. {e.title}
            </h3>
            <ol>
              {e.steps.map((st, j) => (
                <li key={j}>{st}</li>
              ))}
            </ol>
          </div>
        ))}
      </details>
      )}
    </aside>
  );
}
