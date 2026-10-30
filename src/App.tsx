import { useEffect, useReducer, useState } from 'react';
import { TaskBanner } from './components/TaskBanner';
import { TesterNotes } from './components/TesterNotes';
import { Alert } from './components/ui';
import { I18nProvider, LANGS, makeI18n } from './i18n';
import { Checkout } from './screens/Checkout';
import { DispatchScreen } from './screens/Dispatch';
import { HelpScreen, InstructionsScreen } from './screens/Instructions';
import { ScanScreen } from './screens/Scan';
import { SummaryScreen } from './screens/Summary';
import { ALERT_KIND, PRESETS, codeFor, initialState, reducer } from './state';
import type { PresetId, State } from './state';
import { SHOW_TASK_BANNER, taskFor } from './tasks';

const FLOW = 'Scan Bag V1 · Pack, Scan & Dispatch';
const AREA = 'Pack, Scan & Dispatch';

/** Use cases: a titled (blue) row, then the views the use case goes through (preset ids from state.ts). */
const USE_CASES: { title: string; hint: string; steps: PresetId[] }[] = [
  { title: 'USE CASE 1 · Start with a location', hint: 'Checkout → Instructions → Scan Location', steps: ['checkout', 'instructions', 'bag-required'] },
  { title: 'USE CASE 2 · Start with a bag', hint: 'Scan Bag → Scan Location', steps: ['instructions', 'bag-first', 'one-bag'] },
  { title: 'USE CASE 3 · Scan bags into a location', hint: 'Scan Bag until the shelf is full', steps: ['one-bag', 'two-bags'] },
  { title: 'USE CASE 4 · Spread bags across locations', hint: 'Scan Location → Scan Bag → select another', steps: ['second-location', 'bag-in-new-location', 'reselect-location'] },
  { title: 'USE CASE 5 · Finish and hand off', hint: 'Finish → Summary → Ready for Pickup', steps: ['summary'] },
  { title: 'USE CASE 6 · Follow-up after the summary', hint: 'Select a location → delete a location', steps: ['extras-select', 'extras-delete', 'extras-end'] },
  { title: 'USE CASE 7 · Find the instructions again', hint: 'Tap ? in the scanning header', steps: ['help'] },
];

/** Edge cases: same shape; the “Edge cases” recipes in the facilitator hints follow the same numbering. */
const EDGE_CASES: { title: string; hint: string; steps: PresetId[] }[] = [
  { title: 'EDGE CASE 1 · Wrong or duplicate bag', hint: 'Cannot be triggered by tapping', steps: ['err-wrong-bag', 'warn-duplicate'] },
  { title: 'EDGE CASE 2 · Finish before scanning a location', hint: 'Finish disabled in C7 · E2 from the panel', steps: ['bag-first', 'err-no-location'] },
  { title: 'EDGE CASE 3 · Empty location blocks the flow', hint: 'Scan Location twice · Finish', steps: ['second-location', 'err-empty-location', 'err-finish-empty'] },
  { title: 'EDGE CASE 4 · Delete a bag or a location', hint: 'Bin icon · Delete location · slide', steps: ['bag-required', 'two-bags'] },
  { title: 'EDGE CASE 5 · No more shelves', hint: 'More than 4 locations', steps: ['err-no-shelves'] },
];

export default function App() {
  // ?version=current opens today's flow (lets testers on a phone see it without the desktop switch)
  const [s, dispatch] = useReducer(reducer, initialState, (init): State => ({
    ...init,
    version: new URLSearchParams(window.location.search).get('version') === 'current' ? 'current' : 'new',
  }));
  const [navOpen, setNavOpen] = useState(true);
  const [open, setOpen] = useState({ uc: true, ec: true, pl: true });
  const code = codeFor(s);

  // Alerts auto-dismiss; a new alert (new id) restarts the timer.
  useEffect(() => {
    if (!s.alert) return;
    const t = setTimeout(() => dispatch({ type: 'dismissAlert' }), 3500);
    return () => clearTimeout(t);
  }, [s.alert]);

  useEffect(() => {
    if (!s.snack) return;
    const t = setTimeout(() => dispatch({ type: 'snack', message: null }), 3000);
    return () => clearTimeout(t);
  }, [s.snack]);

  const scanLocation = () => dispatch({ type: 'scanLocation' });
  const scanBag = () => dispatch({ type: 'scanBag' });
  const info = () => {}; // Order info is not part of the Scan Bag frames yet.

  const i18n = makeI18n(s.lang);
  const isCurrent = s.version === 'current';
  // each version lists its own presets (the checkout view is shared)
  const presets = PRESETS.filter((p) => (isCurrent ? p.group === 'Current version' || p.id === 'checkout' : p.group !== 'Current version'));
  const row = (id: PresetId) => {
    const p = PRESETS.find((x) => x.id === id)!;
    return (
      <button key={`${id}`} type="button" className={code === p.code ? 'is-on' : undefined} onClick={() => dispatch({ type: 'jump', preset: id })}>
        <b className="proto-nav__code">{p.code}</b>
        {p.label}
      </button>
    );
  };
  const group = (key: 'uc' | 'ec' | 'pl', label: string, count: number) => (
    <button type="button" className="proto-nav__group" aria-expanded={open[key]} onClick={() => setOpen({ ...open, [key]: !open[key] })}>
      <span className="proto-nav__chev" aria-hidden />
      {label}
      <em>{count}</em>
    </button>
  );

  return (
    <I18nProvider value={i18n}>
      <div className="stage">
        <nav className="proto-nav" aria-label="Prototype flow" data-open={navOpen}>
          <button type="button" className="proto-nav__title" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
            <span className="proto-nav__chev" aria-hidden />
            {FLOW}
          </button>
          {navOpen && (
            <>
              {!isCurrent && group('uc', 'Use cases', USE_CASES.length)}
              {!isCurrent && open.uc &&
                USE_CASES.map((u) => (
                  <div key={u.title} style={{ display: 'contents' }}>
                    <div className="proto-nav__uc">
                      {u.title}
                      <small>{u.hint}</small>
                    </div>
                    {u.steps.map(row)}
                  </div>
                ))}

              {!isCurrent && group('ec', 'Edge cases', EDGE_CASES.length)}
              {!isCurrent && open.ec &&
                EDGE_CASES.map((u) => (
                  <div key={u.title} style={{ display: 'contents' }}>
                    <div className="proto-nav__uc">
                      {u.title}
                      <small>{u.hint}</small>
                    </div>
                    {u.steps.map(row)}
                  </div>
                ))}

              {group('pl', isCurrent ? 'Pelican · current version' : 'Pelican', presets.length)}
              {open.pl &&
                presets.map((p, i) => (
                  <div key={p.id} style={{ display: 'contents' }}>
                    {(i === 0 || presets[i - 1].group !== p.group) && <div className="proto-nav__sub">{p.group}</div>}
                    {row(p.id)}
                  </div>
                ))}
            </>
          )}
        </nav>

        <div className="board" onScroll={(e) => e.currentTarget.scrollLeft > 8 && setNavOpen(false)}>
          <section className="board__app" aria-label="App">
            <header className="board__title">
              <h2>Pelican</h2>
              <div className="board__tags">
                <span className="board__tag">Mobile app</span>
                <span className="board__tag board__tag--user">
                  User: <b>Pickers</b>
                </span>
                <span className="board__tag">{AREA}</span>
                <span className="board__tag board__tag--version">
                  Version <b>{isCurrent ? 'Current' : 'New proposal'}</b>
                </span>
                <span className="board__tag board__tag--view">
                  View <b>{code}</b>
                </span>
              </div>
            </header>
            <div className="board__row">
              <div className={SHOW_TASK_BANNER ? 'app' : 'app app--no-banner'}>
                {SHOW_TASK_BANNER && <TaskBanner task={taskFor(s)} />}

                <div className="app__view" dir={i18n.rtl ? 'rtl' : 'ltr'} lang={s.lang}>
                  {s.helpOpen && <HelpScreen onClose={() => dispatch({ type: 'help', open: false })} />}

                  {!s.helpOpen && s.screen === 'checkout' && (
                    <Checkout onBack={() => {}} onContinue={() => dispatch({ type: 'continueCheckout' })} />
                  )}

                  {!s.helpOpen && s.screen === 'instructions' && (
                    <InstructionsScreen onBack={() => dispatch({ type: 'go', screen: 'checkout' })} onInfo={info} onScanLocation={scanLocation} onScanBag={scanBag} />
                  )}

                  {!s.helpOpen && s.screen === 'scan' && (
                    <ScanScreen
                      locations={s.locations}
                      selected={s.selected}
                      lastBag={s.lastBag}
                      onBack={() => dispatch({ type: 'restart' })}
                      onInfo={info}
                      onHelp={() => dispatch({ type: 'help', open: true })}
                      onScanLocation={scanLocation}
                      onScanBag={scanBag}
                      onSelect={(c) => dispatch({ type: 'selectLocation', code: c })}
                      onRemoveBag={(c) => dispatch({ type: 'removeBag', code: c })}
                      onRemoveLocation={(c) => dispatch({ type: 'removeLocation', code: c })}
                      onFinish={() => dispatch({ type: 'finish' })}
                    />
                  )}

                  {!s.helpOpen && s.screen === 'dispatch' && <DispatchScreen c={s.current} dispatch={dispatch} />}

                  {!s.helpOpen && s.screen === 'summary' && <SummaryScreen locations={s.locations} onDone={() => dispatch({ type: 'done' })} />}

                  {s.alert && (
                    <Alert
                      key={s.alert.id}
                      floating
                      variant={ALERT_KIND[s.alert.key]}
                      title={i18n.t(`alert.${s.alert.key}.title`)}
                      onClick={() => dispatch({ type: 'dismissAlert' })}
                    >
                      {i18n.t(`alert.${s.alert.key}.body`)}
                    </Alert>
                  )}

                  {s.snack && (
                    <div className="snack" role="status">
                      {i18n.t(s.snack)}
                    </div>
                  )}
                </div>
              </div>

              <div className="side">
                <div className="side__top">
                  <div className="view-tag" aria-hidden>
                    View <b>{code}</b>
                  </div>
                  <button type="button" className="version-switch" onClick={() => dispatch({ type: 'setVersion', version: isCurrent ? 'new' : 'current' })}>
                    Switch Version
                  </button>
                </div>

                <div className="lang-switch" role="group" aria-label="App language">
                  <span>App language</span>
                  <div className="lang-switch__opts">
                    {LANGS.map((l) => (
                      <button key={l.id} type="button" aria-pressed={s.lang === l.id} onClick={() => dispatch({ type: 'setLang', lang: l.id })}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <TesterNotes s={s} code={code} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </I18nProvider>
  );
}
