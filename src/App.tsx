import { useEffect, useReducer } from 'react';
import { TaskBanner } from './components/TaskBanner';
import { Alert } from './components/ui';
import { Checkout } from './screens/Checkout';
import { HelpScreen, InstructionsScreen } from './screens/Instructions';
import { ScanScreen } from './screens/Scan';
import { SummaryScreen } from './screens/Summary';
import { PRESETS, initialState, reducer } from './state';
import { taskFor } from './tasks';

export default function App() {
  const [s, dispatch] = useReducer(reducer, initialState);

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

  const scan = () => dispatch({ type: 'autoScan' });
  const info = () => {}; // Order info is not part of the Scan Bag frames yet.

  return (
    <div className="stage">
      <nav className="proto-nav" aria-label="Prototype flow">
        <div className="proto-nav__title">Scan Bag V1 · flow</div>
        {PRESETS.map((p, i) => (
          <div key={p.id} style={{ display: 'contents' }}>
            {(i === 0 || PRESETS[i - 1].group !== p.group) && <div className="proto-nav__sub">{p.group}</div>}
            <button type="button" onClick={() => dispatch({ type: 'jump', preset: p.id })}>{p.label}</button>
          </div>
        ))}
      </nav>

      <div className="app">
        <TaskBanner task={taskFor(s)} />

        {s.helpOpen && <HelpScreen onClose={() => dispatch({ type: 'help', open: false })} />}

        {!s.helpOpen && s.screen === 'checkout' && (
          <Checkout onBack={() => {}} onContinue={() => dispatch({ type: 'go', screen: 'instructions' })} />
        )}

        {!s.helpOpen && s.screen === 'instructions' && (
          <InstructionsScreen onBack={() => dispatch({ type: 'go', screen: 'checkout' })} onInfo={info} onScan={scan} />
        )}

        {!s.helpOpen && s.screen === 'scan' && (
          <ScanScreen
            locations={s.locations}
            selected={s.selected}
            lastBag={s.lastBag}
            onBack={() => dispatch({ type: 'go', screen: 'instructions' })}
            onInfo={info}
            onHelp={() => dispatch({ type: 'help', open: true })}
            onOpenScanner={scan}
            onSelect={(code) => dispatch({ type: 'selectLocation', code })}
            onRemoveBag={(code) => dispatch({ type: 'removeBag', code })}
            onRemoveLocation={(code) => dispatch({ type: 'removeLocation', code })}
            onFinish={() => dispatch({ type: 'go', screen: 'summary' })}
          />
        )}

        {!s.helpOpen && s.screen === 'summary' && (
          <SummaryScreen locations={s.locations} onDone={() => dispatch({ type: 'reset', snack: 'Bag data sent to the Rider App' })} />
        )}

        {s.alert && (
          <Alert key={s.alert.id} floating variant={s.alert.kind} title={s.alert.title} onClick={() => dispatch({ type: 'dismissAlert' })}>
            {s.alert.body}
          </Alert>
        )}

        {s.snack && <div className="snack" role="status">{s.snack}</div>}
      </div>
    </div>
  );
}
