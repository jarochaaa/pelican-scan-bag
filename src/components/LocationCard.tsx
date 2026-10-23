import type { Loc } from '../state';
import { assets } from './icons';
import { SwipeToDelete } from './SwipeToDelete';
import { Tag, cx } from './ui';

function BagRow({ code, readOnly, onRemove }: { code: string; readOnly?: boolean; onRemove?: () => void }) {
  return (
    <div className="bag-row">
      <div className="bag-row__field">
        <span className="bag-row__label">Bag</span>
        <div className="bag-row__value">
          <span className="bag-row__code">{code}</span>
                  </div>
      </div>
      {!readOnly && (
        <button type="button" className="bag-row__delete" aria-label={`Remove bag ${code}`} onClick={onRemove}>
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
  const active = variant === 'active';
  const summary = variant === 'summary';
  // Locations with bags slide to delete; the selected border then lives on the swipe frame so it stays put.
  const swipeable = !summary && loc.bags.length > 0;

  const stats = (
    <div className="loc__head">
      {active && <Tag status="success" block>Selected</Tag>}
      <div className="loc__stats">
        <div className="loc__stat">
          <img src={assets.locationOn} alt="" />
          <div className="loc__stat-label">Location</div>
          <div className="loc__stat-value">{loc.code}</div>
        </div>
        <div className="loc__stat">
          <img src={assets.bagTile} alt="" />
          <div className="loc__stat-label">Bags</div>
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
          aria-label={`Select location ${loc.code}`}
          onClick={onSelect}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.()}
        >
          {stats}
          {bagList}
        </div>
    );
    return loc.bags.length > 0 ? (
      <SwipeToDelete label={`Delete location ${loc.code}`} onDelete={() => onRemoveLocation?.()}>
        {idleCard}
      </SwipeToDelete>
    ) : (
      idleCard
    );
  }

  const card = (
    <section className={cx('loc', active && !swipeable && 'loc--selected', summary && 'loc--summary')} aria-label={`Location ${loc.code}`}>
      {stats}
      {bagList}
      {active && (
        <p className="scan-cta">
          <img src={assets.bagCta} alt="" />
          Scan bags to add in this location
        </p>
      )}
      {active && loc.bags.length === 0 && (
        <button type="button" className="delete-loc" onClick={onRemoveLocation}>
          Delete location
        </button>
      )}
    </section>
  );

  // Empty locations are deleted with the text button; with bags attached they slide to delete.
  if (!swipeable) return card;
  return (
    <SwipeToDelete framed={active} label={`Delete location ${loc.code}`} onDelete={() => onRemoveLocation?.()}>
      {card}
    </SwipeToDelete>
  );
}
