import { useI18n } from '../i18n';
import { ORDER_ID } from '../state';
import type { CurrentFlow } from '../state';
import { ChevronRight, assets } from '../components/icons';
import { Alert, Button } from '../components/ui';

type Dispatch = (a: { type: 'curScan' | 'curAddLocation' | 'curAddBags' | 'curClose' | 'curPlus' | 'curConfirm' } | { type: 'curCount'; delta: number }) => void;

const Plus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Minus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5V20h16V9.5M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6.5 18c1.2-2.2 3.2-3.3 5.5-3.3s4.3 1.1 5.5 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

function OrderHead() {
  const { t } = useI18n();
  return (
    <div className="disp-card__order">
      <b>{ORDER_ID}</b>
      <span>{t('storeName')}</span>
    </div>
  );
}

/** Today's bottom sheets: Scan Location, then Number of Bags (same layout as the current app, Pelican 3.0 styling). */
function Sheet({ c, dispatch }: { c: CurrentFlow; dispatch: Dispatch }) {
  const { t } = useI18n();
  const isLocation = c.sheet === 'location';
  return (
    <>
      <div className="disp-backdrop" />
      <div className="disp-sheet" role="dialog" aria-label={isLocation ? t('curScanBanner') : t('curBagsBanner')}>
        <Alert variant="warning" title={isLocation ? t('curScanBanner') : t('curBagsBanner')} />
        <div className="disp-card">
          <OrderHead />
          {isLocation && (
            <button type="button" className="disp-scan" aria-label={t('scan')} onClick={() => dispatch({ type: 'curScan' })}>
              <img src={assets.maximize} alt="" />
            </button>
          )}
          <div className="disp-empty">
            <span className="disp-empty__icon">
              <img src={isLocation ? assets.maximize : assets.bagStep} alt="" />
            </span>
            <p>{isLocation ? t('curScanEmpty') : t('curBagsEmpty')}</p>
          </div>
          {isLocation ? (
            <div className="disp-field" data-empty={!c.scanned}>
              <span>{t('locationNumber')}</span>
              <b>{c.scanned ?? '-'}</b>
            </div>
          ) : (
            <div className="disp-stepper">
              <button type="button" className="disp-stepper__btn" aria-label={t('fewerBags')} disabled={c.count <= 1} onClick={() => dispatch({ type: 'curCount', delta: -1 })}>
                <Minus />
              </button>
              <span className="disp-stepper__value" aria-live="polite">{c.count}</span>
              <button type="button" className="disp-stepper__btn" aria-label={t('moreBags')} onClick={() => dispatch({ type: 'curCount', delta: 1 })}>
                <Plus />
              </button>
            </div>
          )}
        </div>
        <div className="disp-sheet__ctas">
          <button type="button" className="btn btn--secondary" onClick={() => dispatch({ type: 'curClose' })}>
            {t('close')}
          </button>
          <Button disabled={isLocation && !c.scanned} onClick={() => dispatch({ type: isLocation ? 'curAddLocation' : 'curAddBags' })}>
            {t('add')}
          </Button>
        </div>
      </div>
    </>
  );
}

/** Current version · Confirm Order Dispatch (reference: today's Pelican), with the dispatch locations added so far. */
export function DispatchScreen({ c, dispatch }: { c: CurrentFlow; dispatch: Dispatch }) {
  const { t, rich } = useI18n();
  const bags = c.dispatch.reduce((n, d) => n + d.bags, 0);
  return (
    <div className="screen screen-enter">
      <div className="screen__scroll">
        <div className="screen__body disp">
          <h2 className="screen__title">{rich('confirmTitle')}</h2>
          <section className="disp-order">
            <p>
              <img src={assets.bagTile} alt="" />
              <b>{ORDER_ID}</b>
              <span className="disp-order__sep" aria-hidden />
              <StoreIcon />
            </p>
            <p>
              <UserIcon />
              {t('storeName')}
            </p>
          </section>

          <h3 className="section-label">{t('orderDetail')}</h3>
          <div className="disp-row">
            <div>
              <span>{t('totalItems')}</span>
              <b>15</b>
            </div>
          </div>
          <div className="disp-row disp-row--muted">
            <div>
              <span>{t('totalBags')}</span>
              <b>{bags}</b>
            </div>
            <ChevronRight />
          </div>

          <div className="disp-head">
            <h3 className="section-label">{t('dispatchLocation')}</h3>
            <button type="button" className="disp-plus" aria-label={t('addDispatchLocation')} onClick={() => dispatch({ type: 'curPlus' })}>
              <Plus />
            </button>
          </div>
          {c.dispatch.map((d) => (
            <div key={d.code} className="disp-row disp-row--muted">
              <div>
                <span>{t('locationNumber')}</span>
                <b>{d.code}</b>
              </div>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>
      <div className="screen__cta">
        <Button disabled={c.dispatch.length === 0} onClick={() => dispatch({ type: 'curConfirm' })}>
          {t('confirmDispatch')}
        </Button>
      </div>
      {c.sheet && <Sheet c={c} dispatch={dispatch} />}
    </div>
  );
}
