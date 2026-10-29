import { useI18n } from '../i18n';
import { PENDING } from '../state';
import type { Loc } from '../state';
import { assets } from './icons';
import { SwipeToDelete } from './SwipeToDelete';
import { Tag, cx } from './ui';

function BagRow({ code, readOnly, onRemove }: { code: string; readOnly?: boolean; onRemove?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="bag-row">
      <div className="bag-row__field">
        <span className="bag-row__label">{t('bag')}</span>
        <div className="bag-row__value">
          <span className="bag-row__code">{code}</span>
        </div>
      </div>
      {!readOnly && (
        <button type="button" className="bag-row__delete" aria-label={t('removeBag', { code })} onClick={onRemove}>
          <img src={assets.deleteIcon} alt="" />
        </button>
      )}
    </div>
  );
}

interface Props {
  loc: Loc;
  variant: 'active' | 'idle' | 'summary';
  onSelect?: () => void;
  onRemoveBag?: (code: string) => void;
  onRemoveLocation?: () => void;
}

export function LocationCard({ loc, variant, onSelect, onRemoveBag, onRemoveLocation }: Props) {
  const { t } = useI18n();
  const active = variant === 'active';
  /** bags scanned before any location: yellow frame, no shelf code yet */
  const pending = loc.code === PENDING;
  const summary = variant === 'summary';
  // Locations with bags slide to delete; the selected border then lives on the swipe frame so it stays put.
  const swipeable = !summary && loc.bags.length > 0;

  const stats = (
    <div className="loc__head">
      {pending ? <Tag status="warning" block>{t('pendingTag')}</Tag> : active && <Tag status="success" block>{t('selected')}</Tag>}
      <div className="loc__stats">
        <div className="loc__stat">
          <img src={assets.locationOn} alt="" />
          <div className="loc__stat-label">{t('location')}</div>
          <div className="loc__stat-value">{pending ? '-' : loc.code}</div>
        </div>
        <div className="loc__stat">
          <img src={assets.bagTile} alt="" />
          <div className="loc__stat-label">{t('bags')}</div>
          <div className="loc__stat-value">{loc.bags.length}</div>
        </div>
      </div>
    </div>
  );

  const rows = loc.bags.map((code) => (
    <BagRow
      key={code}
      code={code}
      readOnly={summary}
      onRemove={() => onRemoveBag?.(code)}
    />
  ));
  const bagList = rows.length > 0 && <div className="loc__bags">{rows}</div>;

  if (variant === 'idle') {
    // Collapsed location: the whole card re-selects it.
    const idleCard = (
        <div
          className={cx('loc', 'loc--idle')}
          role="button"
          tabIndex={0}
          aria-label={t('selectLocationAria', { code: pending ? '-' : loc.code })}
          onClick={onSelect}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.()}
        >
          {stats}
          {bagList}
        </div>
    );
    return loc.bags.length > 0 ? (
      <SwipeToDelete label={t('deleteLocationAria', { code: loc.code })} onDelete={() => onRemoveLocation?.()}>
        {idleCard}
      </SwipeToDelete>
    ) : (
      idleCard
    );
  }

  const card = (
    <section className={cx('loc', active && !swipeable && 'loc--selected', summary && 'loc--summary')} aria-label={t('locationAria', { code: loc.code })}>
      {stats}
      {bagList}
      {active && (
        <p className="scan-cta">{t(pending ? 'pendingHint' : 'scanHint')}</p>
      )}
      {active && loc.bags.length === 0 && (
        <button type="button" className="delete-loc" onClick={onRemoveLocation}>
          {t('deleteLocation')}
        </button>
      )}
    </section>
  );

  // Empty locations are deleted with the text button; with bags attached they slide to delete.
  if (!swipeable) return card;
  return (
    <SwipeToDelete framed={active ? (pending ? 'warning' : 'success') : undefined} label={t('deleteLocationAria', { code: loc.code })} onDelete={() => onRemoveLocation?.()}>
      {card}
    </SwipeToDelete>
  );
}
