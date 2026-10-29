import { useI18n } from '../i18n';
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
  const { t } = useI18n();
  return (
    <div className="screen screen-enter">
      <div className="screen__scroll screen__scroll--fixed">
        <PageHeader onLeading={onBack} onInfo={onInfo} timer={{ label: t('minutes', { n: 3 }), tone: 'danger' }} />
        <div className="screen__body">
          <h2 className="screen__title">{t('packScan')}</h2>
          <InstructionsCard />
        </div>
      </div>
      <ScannerFabs onLocation={onScanLocation} onBag={onScanBag} />
    </div>
  );
}

export function HelpScreen({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="screen screen-enter">
      <div className="screen__scroll screen__scroll--fixed">
        <PageHeader title={t('help')} leading="close" onLeading={onClose} />
        <div className="screen__body">
          <h2 className="screen__title">{t('packScan')}</h2>
          <InstructionsCard />
        </div>
      </div>
    </div>
  );
}
