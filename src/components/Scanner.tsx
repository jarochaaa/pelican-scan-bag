import { assets } from './icons';

export function ScannerFab({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="scanner-fab" onClick={onClick} aria-label="Scan">
      <span className="scanner-fab__pill">
        <img src={assets.addPhoto} alt="" />
        Scanner
      </span>
    </button>
  );
}
