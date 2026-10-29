import { useI18n } from '../i18n';
import { assets } from './icons';

/** Two stacked scan buttons: green "Scan Location" above orange "Scan Bag". */
export function ScannerFabs({ onLocation, onBag }: { onLocation: () => void; onBag: () => void }) {
  const { t } = useI18n();
  return (
    <div className="scanner-fabs">
      <button type="button" className="scanner-fab scanner-fab--location" onClick={onLocation}>
        <img src={assets.addPhoto} alt="" />
        {t('scanLocation')}
      </button>
      <button type="button" className="scanner-fab" onClick={onBag}>
        <img src={assets.addPhoto} alt="" />
        {t('scanBag')}
      </button>
    </div>
  );
}
