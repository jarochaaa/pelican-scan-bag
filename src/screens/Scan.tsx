import type { Loc } from '../state';
import { LocationCard } from '../components/LocationCard';
import { PageHeader } from '../components/PageHeader';
import { ScannerFabs } from '../components/Scanner';
import { Button, Indicator } from '../components/ui';
import { totalBags } from '../state';

interface Props {
  locations: Loc[];
  selected: string | null;
  lastBag: string | null;
  onBack: () => void;
  onInfo: () => void;
  onHelp: () => void;
  onScanLocation: () => void;
  onScanBag: () => void;
  onSelect: (code: string) => void;
  onRemoveBag: (code: string) => void;
  onRemoveLocation: (code: string) => void;
  onFinish: () => void;
}

/** Scanning process: locations list, one selected at a time; bags are added to the selected location. */
export function ScanScreen(p: Props) {
  const canFinish = totalBags(p.locations) > 0;

  return (
    <div className="screen screen-enter">
      <div className="screen__scroll screen__scroll--fixed">
        <PageHeader onLeading={p.onBack} onInfo={p.onInfo} onHelp={p.onHelp} timer={{ label: '3 min', tone: 'danger' }} />
        <div className="screen__body">
          <h2 className="screen__title">Pack, Scan &amp; Dispatch</h2>
          <section className="panel" aria-labelledby="locations-title">
            <div className="panel__head">
              <h3 id="locations-title" className="panel__title" style={{ margin: 0 }}>Locations</h3>
              <Indicator status="branded">{p.locations.length}</Indicator>
            </div>
            <div className="locations">
              {p.locations.map((loc) => (
                <LocationCard
                  key={loc.code}
                  loc={loc}
                  variant={loc.code === p.selected ? 'active' : 'idle'}
                  onSelect={() => p.onSelect(loc.code)}
                  onRemoveBag={p.onRemoveBag}
                  onRemoveLocation={() => p.onRemoveLocation(loc.code)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="screen__cta">
        <Button disabled={!canFinish} onClick={p.onFinish}>Finish</Button>
      </div>
      <ScannerFabs onLocation={p.onScanLocation} onBag={p.onScanBag} />
    </div>
  );
}
