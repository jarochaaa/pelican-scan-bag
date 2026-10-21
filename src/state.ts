export type ScreenId = 'checkout' | 'instructions' | 'scan' | 'summary';

export interface Loc {
  code: string;
  /** newest first */
  bags: string[];
}

export interface AlertMsg {
  id: number;
  kind: 'error' | 'warning';
  title: string;
  body: string;
}

export interface State {
  screen: ScreenId;
  locations: Loc[];
  selected: string | null;
  /** bag that was just scanned — gets the "Please, place this bag" hint */
  lastBag: string | null;
  alert: AlertMsg | null;
  alertSeq: number;
  helpOpen: boolean;
  snack: string | null;
}

export const ORDER_ID = '#123';
/** The three bags that belong to order #123 (Figma: "Place 3 bags in dispatching area by scanning"). */
export const ORDER_BAGS = ['5466', '1234', '9988'];
const AUTO_LOCATIONS = ['001-38-01A', '001-41-01B'];
/** Bags that fit in a location before the picker moves to the next one (Figma: 2 bags, then a new location). */
const BAGS_PER_LOCATION = 2;

const LOCATION_RE = /^\d{3}-\d{2}-\d{2}[A-Z]$/;
const BAG_RE = /^\d{4}$/;

export const initialState: State = {
  screen: 'checkout',
  locations: [],
  selected: null,
  lastBag: null,
  alert: null,
  alertSeq: 0,
  helpOpen: false,
  snack: null,
};

export type Action =
  | { type: 'go'; screen: ScreenId }
  | { type: 'scan'; code: string }
  | { type: 'selectLocation'; code: string }
  | { type: 'removeBag'; code: string }
  | { type: 'removeLocation'; code: string }
  | { type: 'autoScan' }
  | { type: 'help'; open: boolean }
  | { type: 'dismissAlert' }
  | { type: 'snack'; message: string | null }
  | { type: 'jump'; preset: PresetId }
  | { type: 'reset'; snack?: string };

function raise(state: State, kind: AlertMsg['kind'], title: string, body: string): State {
  const alertSeq = state.alertSeq + 1;
  return { ...state, alertSeq, alert: { id: alertSeq, kind, title, body } };
}

export function totalBags(locations: Loc[]) {
  return locations.reduce((n, l) => n + l.bags.length, 0);
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'go':
      return { ...state, screen: action.screen, alert: null };

    case 'scan': {
      const code = action.code.trim().toUpperCase();

      if (LOCATION_RE.test(code)) {
        const exists = state.locations.some((l) => l.code === code);
        return {
          ...state,
          screen: 'scan',
          alert: null,
          lastBag: null,
          selected: code,
          locations: exists ? state.locations : [{ code, bags: [] }, ...state.locations],
        };
      }

      if (BAG_RE.test(code)) {
        if (state.screen !== 'scan' || !state.selected) {
          return raise(state, 'error', 'Scan a location first', 'Scan the shelf location before scanning bags');
        }
        if (!ORDER_BAGS.includes(code)) {
          return raise(state, 'error', 'Wrong bag', 'This bag belongs to another order');
        }
        if (state.locations.some((l) => l.bags.includes(code))) {
          return raise(state, 'warning', 'Bag already scanned', 'Try scanning another bag');
        }
        return {
          ...state,
          alert: null,
          lastBag: code,
          locations: state.locations.map((l) => (l.code === state.selected ? { ...l, bags: [code, ...l.bags] } : l)),
        };
      }

      return raise(state, 'error', 'Code not recognized', 'Try scanning again');
    }

    case 'selectLocation':
      return { ...state, selected: action.code, lastBag: null };

    case 'removeBag':
      return {
        ...state,
        lastBag: state.lastBag === action.code ? null : state.lastBag,
        locations: state.locations.map((l) => ({ ...l, bags: l.bags.filter((b) => b !== action.code) })),
      };

    case 'removeLocation': {
      const locations = state.locations.filter((l) => l.code !== action.code);
      if (locations.length === 0) return { ...initialState, alertSeq: state.alertSeq, screen: 'instructions' };
      const removedSelected = state.selected === action.code;
      return {
        ...state,
        locations,
        selected: removedSelected ? locations[0].code : state.selected,
        lastBag: null,
      };
    }

    case 'autoScan': {
      // Simulated scanner: every tap is a successful scan.
      // First tap scans the shelf location, the following taps scan the next bag of the order.
      if (state.screen === 'instructions') return reducer(state, { type: 'scan', code: AUTO_LOCATIONS[0] });
      if (state.screen !== 'scan') return state;
      const next = ORDER_BAGS.find((b) => !state.locations.some((l) => l.bags.includes(b)));
      if (!next) return state;
      // Selected location is full and there is still a bag left: scan the next shelf location first.
      const current = state.locations.find((l) => l.code === state.selected);
      const nextLocation = AUTO_LOCATIONS.find((c) => !state.locations.some((l) => l.code === c));
      if (current && current.bags.length >= BAGS_PER_LOCATION && nextLocation) {
        return reducer(state, { type: 'scan', code: nextLocation });
      }
      return reducer(state, { type: 'scan', code: next });
    }
    case 'help':
      return { ...state, helpOpen: action.open };
    case 'dismissAlert':
      return { ...state, alert: null };
    case 'snack':
      return { ...state, snack: action.message };
    case 'reset':
      return { ...initialState, alertSeq: state.alertSeq, snack: action.snack ?? null };
    case 'jump':
      return applyPreset(state, action.preset);
  }
}

/* ---------- Presets: jump straight to any state of the flow (used by the desktop navigator) ---------- */

export type PresetId =
  | 'checkout'
  | 'instructions'
  | 'help'
  | 'bag-required'
  | 'one-bag'
  | 'two-bags'
  | 'second-location'
  | 'reselect-location'
  | 'bag-in-new-location'
  | 'summary'
  | 'err-wrong-bag'
  | 'err-no-location'
  | 'warn-duplicate';

export const PRESETS: { id: PresetId; label: string; group: string }[] = [
  { id: 'checkout', label: 'Checkout done view', group: 'Entry' },
  { id: 'instructions', label: 'Instructions', group: 'Entry' },
  { id: 'help', label: 'Help (same instructions)', group: 'Entry' },
  { id: 'bag-required', label: 'Bag required · 0 bags', group: 'Scanning' },
  { id: 'one-bag', label: '1 bag scanned', group: 'Scanning' },
  { id: 'two-bags', label: '2 bags scanned', group: 'Scanning' },
  { id: 'second-location', label: 'New location scanned', group: 'Scanning' },
  { id: 'reselect-location', label: 'Back to first location', group: 'Scanning' },
  { id: 'bag-in-new-location', label: 'Bag in new location', group: 'Scanning' },
  { id: 'err-wrong-bag', label: 'Error · Wrong bag', group: 'Alerts' },
  { id: 'err-no-location', label: 'Error · Scan a location first', group: 'Alerts' },
  { id: 'warn-duplicate', label: 'Warning · Bag already scanned', group: 'Alerts' },
  { id: 'summary', label: 'Summary + rider handoff', group: 'End' },
];

function applyPreset(prev: State, preset: PresetId): State {
  const base: State = { ...initialState, alertSeq: prev.alertSeq };
  const A = '001-38-01A';
  const B = '001-41-01B';
  const scan = (locations: Loc[], selected: string, lastBag: string | null): State => ({
    ...base,
    screen: 'scan',
    locations,
    selected,
    lastBag,
  });

  switch (preset) {
    case 'checkout':
      return base;
    case 'instructions':
      return { ...base, screen: 'instructions' };
    case 'help':
      return { ...base, screen: 'instructions', helpOpen: true };
    case 'bag-required':
      return scan([{ code: A, bags: [] }], A, null);
    case 'one-bag':
      return scan([{ code: A, bags: ['5466'] }], A, '5466');
    case 'two-bags':
      return scan([{ code: A, bags: ['1234', '5466'] }], A, '1234');
    case 'second-location':
      return scan([{ code: B, bags: [] }, { code: A, bags: ['1234', '5466'] }], B, null);
    case 'reselect-location':
      return scan([{ code: B, bags: [] }, { code: A, bags: ['1234', '5466'] }], A, null);
    case 'bag-in-new-location':
      return scan([{ code: B, bags: ['9988'] }, { code: A, bags: ['1234', '5466'] }], B, '9988');
    case 'summary':
      return {
        ...base,
        screen: 'summary',
        locations: [{ code: B, bags: ['9988'] }, { code: A, bags: ['1234', '5466'] }],
        selected: B,
      };
    case 'err-wrong-bag':
      return raise({ ...scan([{ code: A, bags: [] }], A, null) }, 'error', 'Wrong bag', 'This bag belongs to another order');
    case 'err-no-location':
      return raise({ ...base, screen: 'instructions' }, 'error', 'Scan a location first', 'Scan the shelf location before scanning bags');
    case 'warn-duplicate':
      return raise(scan([{ code: A, bags: ['5466'] }], A, '5466'), 'warning', 'Bag already scanned', 'Try scanning another bag');
  }
}
