import { InstructionsCard } from '../components/Instructions';
import { PageHeader } from '../components/PageHeader';
import { ScannerFabs } from '../components/Scanner';

/** Pack, Scan & Dispatch · Instructions — entry point of the flow, and what the Help screen reopens. */
export function InstructionsScreen({
  onBack,
  onInfo,
  onScanLocation,
  onScanBag,
}: {
  onBack: () => void;
  onInfo: () => void;
  onScanLocation: () => void;
  onScanBag: () => void;
}) {
  return (
    <div className="screen screen-enter">
      <div className="screen__scroll screen__scroll--fixed">
        <PageHeader onLeading={onBack} onInfo={onInfo} timer={{ label: '3 min', tone: 'danger' }} />
        <div className="screen__body">
          <h2 className="screen__title">Pack, Scan &amp; Dispatch</h2>
          <InstructionsCard />
        </div>
      </div>
      <ScannerFabs onLocation={onScanLocation} onBag={onScanBag} />
    </div>
  );
}

export function HelpScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="screen screen-enter">
      <div className="screen__scroll screen__scroll--fixed">
        <PageHeader title="Help" leading="close" onLeading={onClose} />
        <div className="screen__body">
          <h2 className="screen__title">Pack, Scan &amp; Dispatch</h2>
          <InstructionsCard />
        </div>
      </div>
    </div>
  );
}
