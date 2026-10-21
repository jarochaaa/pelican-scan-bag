import { ORDER_ID } from '../state';
import { assets, HelpCircle, InfoCircle } from './icons';
import { IconButton, cx } from './ui';

interface Props {
  title?: string;
  leading?: 'back' | 'close' | 'none';
  onLeading?: () => void;
  onInfo?: () => void;
  onHelp?: () => void;
  timer?: { label: string; tone: 'muted' | 'danger' };
  flatButtons?: boolean;
}

export function PageHeader({ title = ORDER_ID, leading = 'back', onLeading, onInfo, onHelp, timer, flatButtons }: Props) {
  return (
    <header className="page-header">
      <div className="page-header__left">
        {leading !== 'none' && (
          <button type="button" className="icon-btn" aria-label={leading === 'close' ? 'Close' : 'Back'} onClick={onLeading}>
            <img src={leading === 'close' ? assets.close : assets.arrowBackward} width={24} height={24} alt="" />
          </button>
        )}
        <h1 className="page-header__title">{title}</h1>
      </div>
      <div className="page-header__right">
        {onInfo && <IconButton label="Order info" icon={<InfoCircle />} onClick={onInfo} flat={flatButtons} />}
        {onHelp && <IconButton label="Help" icon={<HelpCircle />} onClick={onHelp} flat={flatButtons} />}
        {timer && <span className={cx('page-header__timer', timer.tone === 'danger' && 'page-header__timer--danger')}>{timer.label}</span>}
      </div>
    </header>
  );
}
