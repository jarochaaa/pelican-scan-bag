import type { Lang } from './i18n';

export type ScreenId = 'checkout' | 'instructions' | 'scan' | 'summary' | 'dispatch';

/** Which Pelican proposal is shown: the new Scan Bag flow, or today's flow (Scan Location → Number of Bags → Confirm Order Dispatch). */
export type Version = 'new' | 'current';

/** Today's flow: dispatch locations with a bag count each, plus the sheet that is open. */
export interface CurrentFlow {
  sheet: 'location' | 'bags' | null;
  /** location scanned in the Scan Location sheet, not added yet */
  scanned: string | null;
  /** value of the Number of Bags stepper */
  count: number;
  dispatch: { code: string; bags: number }[];
}

const emptyCurrent: CurrentFlow = { sheet: null, scanned: null, count: 1, dispatch: [] };

export interface Loc {
  code: string;
  /** newest first */
  bags: string[];
}

export type AlertKey = 'wrong' | 'noLocation' | 'duplicate' | 'emptyLocation' | 'noBags' | 'noShelves' | 'unknown';

/** Alert copy lives in i18n (`alert.<key>.title` / `.body`); the key also drives the view code. */
export const ALERT_KIND: Record<AlertKey, 'error' | 'warning'> = {
  wrong: 'error',
  noLocation: 'error',
  duplicate: 'warning',
  emptyLocation: 'error',
  noBags: 'error',
  noShelves: 'warning',
  unknown: 'error',
};

export interface AlertMsg {
  id: number;
  key: AlertKey;
}

export interface State {
  screen: ScreenId;
  locations: Loc[];
  selected: string | null;
  /** bag that was just scanned — gets the "Please, place this bag" hint */
  lastBag: string | null;
  alert: AlertMsg | null;
  alertSeq: number;
  /** app language (the navigator, hints and banner stay English) */
  lang: Lang;
  helpOpen: boolean;
  /** transient message after Done (i18n key) */
  snack: 'sent' | 'dispatched' | null;
  /** follow-up test tasks that run after step 8 (summary → Done): select another location → delete a location → end */
  extras: 'select' | 'delete' | 'end' | null;
  version: Version;
  current: CurrentFlow;
}

export const ORDER_ID = '#123';
/** The three bags that belong to order #123 (Figma: "Place 3 bags in dispatching area by scanning"). */
export const ORDER_BAGS = ['5466', '1234', '9988'];
/** Code of a location opened by scanning a bag first: it has bags but no shelf yet (Figma 49068:19941). */
export const PENDING = 'pending';

/** Shelf locations the simulated scanner "reads", in order. */
const SCAN_LOCATIONS = ['001-38-01A', '001-41-01B', '001-44-02C', '001-47-02D'];

const LOCATION_RE = /^\d{3}-\d{2}-\d{2}[A-Z]$/;
const BAG_RE = /^\d{4}$/;

export const initialState: State = {
  screen: 'checkout',
  locations: [],
  selected: null,
  lastBag: null,
  alert: null,
  alertSeq: 0,
  lang: 'en',
  helpOpen: false,
  snack: null,
  extras: null,
  version: 'new',
  current: emptyCurrent,
};

export type Action =
  | { type: 'go'; screen: ScreenId }
  | { type: 'setVersion'; version: Version }
  | { type: 'continueCheckout' }
  | { type: 'curScan' }
  | { type: 'curAddLocation' }
  | { type: 'curCount'; delta: number }
  | { type: 'curAddBags' }
  | { type: 'curClose' }
  | { type: 'curPlus' }
  | { type: 'curConfirm' }
  | { type: 'scan'; code: string }
  | { type: 'selectLocation'; code: string }
  | { type: 'removeBag'; code: string }
  | { type: 'removeLocation'; code: string }
  | { type: 'scanLocation' }
  | { type: 'scanBag' }
  | { type: 'help'; open: boolean }
  | { type: 'dismissAlert' }
  | { type: 'snack'; message: 'sent' | 'dispatched' | null }
  | { type: 'setLang'; lang: Lang }
  | { type: 'jump'; preset: PresetId }
  | { type: 'done' }
  | { type: 'restart' }
  | { type: 'finish' }
  | { type: 'reset'; snack?: 'sent' };

function raise(state: State, key: AlertKey): State {
  const alertSeq = state.alertSeq + 1;
  return { ...state, alertSeq, alert: { id: alertSeq, key } };
}

export function totalBags(locations: Loc[]) {
  return locations.reduce((n, l) => n + l.bags.length, 0);
}

function baseReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setVersion':
      return { ...initialState, alertSeq: state.alertSeq, version: action.version };
    case 'continueCheckout':
      // New proposal → Instructions. Current flow → Confirm Order Dispatch with the Scan Location sheet open.
      return state.version === 'current'
        ? { ...state, screen: 'dispatch', current: { ...emptyCurrent, sheet: 'location' } }
        : { ...state, screen: 'instructions' };
    case 'curScan': {
      // Simulated successful scan of the next free shelf.
      const used = new Set(state.current.dispatch.map((d) => d.code));
      const next = SCAN_LOCATIONS.find((c) => !used.has(c)) ?? SCAN_LOCATIONS[0];
      return { ...state, current: { ...state.current, scanned: next } };
    }
    case 'curAddLocation':
      return state.current.scanned ? { ...state, current: { ...state.current, sheet: 'bags', count: 1 } } : state;
    case 'curCount':
      return { ...state, current: { ...state.current, count: Math.max(1, state.current.count + action.delta) } };
    case 'curAddBags': {
      const c = state.current;
      if (!c.scanned) return state;
      return { ...state, current: { ...c, sheet: null, scanned: null, count: 1, dispatch: [...c.dispatch, { code: c.scanned, bags: c.count }] } };
    }
    case 'curClose':
      return { ...state, current: { ...state.current, sheet: null, scanned: null, count: 1 } };
    case 'curPlus':
      return { ...state, current: { ...state.current, sheet: 'location', scanned: null, count: 1 } };
    case 'curConfirm':
      return { ...initialState, alertSeq: state.alertSeq, version: state.version, snack: 'dispatched' };

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
          return raise(state, 'noLocation');
        }
        if (!ORDER_BAGS.includes(code)) {
          return raise(state, 'wrong');
        }
        if (state.locations.some((l) => l.bags.includes(code))) {
          return raise(state, 'duplicate');
        }
        return {
          ...state,
          alert: null,
          lastBag: code,
          locations: state.locations.map((l) => (l.code === state.selected ? { ...l, bags: [code, ...l.bags] } : l)),
        };
      }

      return raise(state, 'unknown');
    }

    case 'selectLocation':
      return { ...state, selected: action.code, lastBag: null, extras: state.extras === 'select' ? 'delete' : state.extras };

    case 'removeBag':
      return {
        ...state,
        lastBag: state.lastBag === action.code ? null : state.lastBag,
        locations: state.locations.map((l) => ({ ...l, bags: l.bags.filter((b) => b !== action.code) })),
      };

    case 'removeLocation': {
      const locations = state.locations.filter((l) => l.code !== action.code);
      const extras = state.extras === 'delete' ? 'end' : state.extras;
      if (locations.length === 0) return { ...initialState, alertSeq: state.alertSeq, screen: 'instructions', extras };
      const removedSelected = state.selected === action.code;
      return {
        ...state,
        locations,
        selected: removedSelected ? locations[0].code : state.selected,
        lastBag: null,
        extras,
      };
    }

    case 'scanLocation': {
      const next = SCAN_LOCATIONS.find((c) => !state.locations.some((l) => l.code === c));
      // Bags scanned first: the shelf scanned now becomes their location (and it gets selected).
      if (state.locations.some((l) => l.code === PENDING)) {
        if (!next) return raise(state, 'noShelves');
        return {
          ...state,
          alert: null,
          selected: next,
          locations: state.locations.map((l) => (l.code === PENDING ? { ...l, code: next } : l)),
        };
      }
      // An empty location blocks scanning a new one: it must be deleted first.
      if (state.locations.some((l) => l.bags.length === 0)) {
        return raise(state, 'emptyLocation');
      }
      // Simulated successful scan: adds the next shelf as a new, empty, selected location.
      if (!next) return raise(state, 'noShelves');
      return baseReducer(state, { type: 'scan', code: next });
    }

    case 'scanBag': {
      // Simulated successful scan, no limit: the order's 3 bags first, then generated codes (4001, 4002…).
      const scanned = new Set(state.locations.flatMap((l) => l.bags));
      let code = ORDER_BAGS.find((b) => !scanned.has(b));
      for (let n = 4001; !code; n++) if (!scanned.has(String(n))) code = String(n);
      // No location selected yet: bag first. Open a location without shelf that waits for a location scan.
      if (state.screen !== 'scan' || state.selected === null) {
        return {
          ...state,
          screen: 'scan',
          alert: null,
          lastBag: code,
          selected: PENDING,
          locations: [{ code: PENDING, bags: [code] }, ...state.locations.filter((l) => l.code !== PENDING)],
        };
      }
      return {
        ...state,
        alert: null,
        lastBag: code,
        locations: state.locations.map((l) => (l.code === state.selected ? { ...l, bags: [code, ...l.bags] } : l)),
      };
    }

    case 'help':
      return { ...state, helpOpen: action.open };
    case 'dismissAlert':
      return { ...state, alert: null };
    case 'snack':
      return { ...state, snack: action.message };
    case 'restart':
      // Back from scanning: start from a clean sheet (no locations or bags kept).
      return { ...initialState, alertSeq: state.alertSeq, screen: 'instructions' };

    case 'finish': {
      if (state.locations.some((l) => l.code === PENDING)) return raise(state, 'noLocation');
      if (state.locations.some((l) => l.bags.length === 0)) {
        return raise(state, 'noBags');
      }
      return { ...state, screen: 'summary', alert: null };
    }

    case 'done': {
      // First Done ends step 8 and opens the follow-up tasks on the (still full) scan screen; a later Done restarts.
      if (state.extras) return { ...initialState, alertSeq: state.alertSeq, snack: 'sent' };
      return {
        ...state,
        screen: 'scan',
        extras: state.locations.length >= 2 ? 'select' : 'delete',
        snack: 'sent',
      };
    }

    case 'reset':
      return { ...initialState, alertSeq: state.alertSeq, snack: action.snack ?? null };
    case 'jump':
      return applyPreset(state, action.preset);
    case 'setLang':
      return { ...state, lang: action.lang };
  }
}

/** Language lives outside the flow: switching it never resets anything, and resets/jumps never change it. */
export function reducer(state: State, action: Action): State {
  if (action.type === 'setLang') return { ...state, lang: action.lang };
  const next = baseReducer(state, action);
  // the version only changes when switched, or when a preset of the other version is opened
  const version = action.type === 'jump' || action.type === 'setVersion' ? next.version : state.version;
  return { ...next, lang: state.lang, version };
}

/* ---------- Presets: jump straight to any state of the flow (used by the desktop navigator) ---------- */

export type PresetId =
  | 'checkout'
  | 'instructions'
  | 'help'
  | 'bag-required'
  | 'bag-first'
  | 'one-bag'
  | 'two-bags'
  | 'second-location'
  | 'reselect-location'
  | 'bag-in-new-location'
  | 'summary'
  | 'err-wrong-bag'
  | 'err-no-location'
  | 'warn-duplicate'
  | 'err-empty-location'
  | 'err-finish-empty'
  | 'err-no-shelves'
  | 'extras-select'
  | 'extras-delete'
  | 'extras-end'
  | 'cur-scan'
  | 'cur-scanned'
  | 'cur-bags'
  | 'cur-confirm'
  | 'cur-confirm-empty'
  | 'cur-add-more';

export const PRESETS: { id: PresetId; code: string; label: string; group: string }[] = [
  { id: 'checkout', code: 'A1', label: 'Checkout done view', group: 'Entry' },
  { id: 'instructions', code: 'B1', label: 'Instructions', group: 'Entry' },
  { id: 'help', code: 'B2', label: 'Help (same instructions)', group: 'Entry' },
  { id: 'bag-required', code: 'C1', label: 'Location scanned · 0 bags', group: 'Scanning' },
  { id: 'bag-first', code: 'C7', label: 'Bag scanned first · no location yet', group: 'Scanning' },
  { id: 'one-bag', code: 'C2', label: '1 bag scanned', group: 'Scanning' },
  { id: 'two-bags', code: 'C3', label: '2 bags scanned', group: 'Scanning' },
  { id: 'second-location', code: 'C4', label: 'New location scanned', group: 'Scanning' },
  { id: 'reselect-location', code: 'C5', label: 'Back to first location', group: 'Scanning' },
  { id: 'bag-in-new-location', code: 'C6', label: 'Bag in new location', group: 'Scanning' },
  { id: 'err-wrong-bag', code: 'E1', label: 'Error · Wrong bag', group: 'Alerts' },
  { id: 'err-no-location', code: 'E2', label: 'Error · Finish before scanning a location', group: 'Alerts' },
  { id: 'warn-duplicate', code: 'E3', label: 'Warning · Bag already scanned', group: 'Alerts' },
  { id: 'err-empty-location', code: 'E4', label: 'Error · Location open and empty', group: 'Alerts' },
  { id: 'err-finish-empty', code: 'E5', label: 'Error · A location has no bags', group: 'Alerts' },
  { id: 'err-no-shelves', code: 'E6', label: 'Warning · No more shelves', group: 'Alerts' },
  { id: 'summary', code: 'D1', label: 'Summary + rider handoff', group: 'End' },
  { id: 'extras-select', code: 'F1', label: 'After step 8 · select location', group: 'Follow-up' },
  { id: 'extras-delete', code: 'F2', label: 'After step 8 · delete location', group: 'Follow-up' },
  { id: 'extras-end', code: 'F3', label: 'After step 8 · end of the test', group: 'Follow-up' },
  { id: 'cur-scan', code: 'G1', label: 'Scan Location sheet', group: 'Current version' },
  { id: 'cur-scanned', code: 'G2', label: 'Location scanned', group: 'Current version' },
  { id: 'cur-bags', code: 'G3', label: 'Number of Bags sheet', group: 'Current version' },
  { id: 'cur-confirm', code: 'G4', label: 'Confirm Order Dispatch', group: 'Current version' },
  { id: 'cur-add-more', code: 'G4', label: 'Confirm · 2 dispatch locations', group: 'Current version' },
  { id: 'cur-confirm-empty', code: 'G5', label: 'Confirm · no dispatch location', group: 'Current version' },
];

/** Alert key → view code (alerts sit on top of whichever screen is showing). */
const ALERT_CODE: Record<AlertKey, string> = { wrong: 'E1', noLocation: 'E2', duplicate: 'E3', emptyLocation: 'E4', noBags: 'E5', noShelves: 'E6', unknown: 'E7' };

/**
 * View code of the current state, derived (never hard-coded per screen) so it never drops out in free play.
 * Keep in sync with PRESETS above.
 */
export function codeFor(s: State): string {
  if (s.alert) return ALERT_CODE[s.alert.key];
  if (s.helpOpen) return 'B2';
  if (s.screen === 'dispatch') {
    const c = s.current;
    if (c.sheet === 'location') return c.scanned ? 'G2' : 'G1';
    if (c.sheet === 'bags') return 'G3';
    return c.dispatch.length ? 'G4' : 'G5';
  }
  if (s.screen === 'checkout') return 'A1';
  if (s.screen === 'instructions') return 'B1';
  if (s.screen === 'summary') return 'D1';
  if (s.extras) return s.extras === 'select' ? 'F1' : s.extras === 'delete' ? 'F2' : 'F3';
  const sel = s.locations.find((l) => l.code === s.selected);
  if (sel?.code === PENDING) return 'C7';
  const bags = totalBags(s.locations);
  if (s.locations.length <= 1) return bags === 0 ? 'C1' : bags === 1 ? 'C2' : 'C3';
  if (sel && sel.bags.length === 0) return 'C4';
  if (sel && sel.code !== s.locations[0].code) return 'C5';
  return 'C6';
}

function applyPreset(prev: State, preset: PresetId): State {
  const next = presetState(prev, preset);
  // checkout is shared by both versions; every other preset belongs to one version
  const version = preset === 'checkout' ? prev.version : preset.startsWith('cur-') ? 'current' : 'new';
  return { ...next, version };
}

function presetState(prev: State, preset: PresetId): State {
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
    case 'bag-first':
      return scan([{ code: PENDING, bags: ['5466'] }], PENDING, '5466');
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
    case 'extras-select':
      return { ...scan([{ code: B, bags: ['9988'] }, { code: A, bags: ['1234', '5466'] }], B, null), extras: 'select' };
    case 'cur-scan':
      return { ...base, version: 'current', screen: 'dispatch', current: { ...emptyCurrent, sheet: 'location' } };
    case 'cur-scanned':
      return { ...base, version: 'current', screen: 'dispatch', current: { ...emptyCurrent, sheet: 'location', scanned: A } };
    case 'cur-bags':
      return { ...base, version: 'current', screen: 'dispatch', current: { ...emptyCurrent, sheet: 'bags', scanned: A, count: 3 } };
    case 'cur-confirm':
      return { ...base, version: 'current', screen: 'dispatch', current: { ...emptyCurrent, dispatch: [{ code: A, bags: 3 }] } };
    case 'cur-add-more':
      return { ...base, version: 'current', screen: 'dispatch', current: { ...emptyCurrent, dispatch: [{ code: A, bags: 2 }, { code: B, bags: 1 }] } };
    case 'cur-confirm-empty':
      return { ...base, version: 'current', screen: 'dispatch', current: emptyCurrent };
    case 'extras-end':
      return { ...scan([{ code: A, bags: ['1234', '5466'] }], A, null), extras: 'end' };
    case 'err-empty-location':
      return raise(scan([{ code: B, bags: [] }, { code: A, bags: ['1234', '5466'] }], B, null), 'emptyLocation');
    case 'err-finish-empty':
      return raise(scan([{ code: B, bags: [] }, { code: A, bags: ['1234', '5466'] }], B, null), 'noBags');
    case 'err-no-shelves':
      return raise(
        scan(
          [
            { code: '001-47-02D', bags: ['4001'] },
            { code: '001-44-02C', bags: ['9988'] },
            { code: B, bags: ['5466'] },
            { code: A, bags: ['1234'] },
          ],
          '001-47-02D',
          null,
        ),
        'noShelves',
      );
    case 'extras-delete':
      return { ...scan([{ code: B, bags: ['9988'] }, { code: A, bags: ['1234', '5466'] }], A, null), extras: 'delete' };
    case 'err-wrong-bag':
      return raise(scan([{ code: A, bags: [] }], A, null), 'wrong');
    case 'err-no-location':
      return raise(scan([{ code: PENDING, bags: ['5466'] }], PENDING, '5466'), 'noLocation');
    case 'warn-duplicate':
      return raise(scan([{ code: A, bags: ['5466'] }], A, '5466'), 'duplicate');
  }
}
