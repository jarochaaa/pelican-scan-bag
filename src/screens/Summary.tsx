import { useI18n } from '../i18n';
import type { Loc } from '../state';
import { totalBags, ORDER_ID } from '../state';
import { ChatEllipsis, ChevronRight, Phone, assets } from '../components/icons';
import { LocationCard } from '../components/LocationCard';
import { PageHeader } from '../components/PageHeader';
import { Button, IconButton, Indicator, Tag } from '../components/ui';

export function SummaryScreen({ locations, onDone }: { locations: Loc[]; onDone: () => void }) {
  const { t } = useI18n();
  const bags = totalBags(locations);

  return (
    <div className="screen screen-enter">
      <div className="screen__scroll">
        <PageHeader leading="none" />
        <div className="summary" style={{ paddingTop: 0 }}>
          <section className="surface hero">
            <img src={assets.trophy} alt="" />
            <div>
              <h2 className="hero__title">{t('orderCompleted', { id: ORDER_ID })}</h2>
              <p className="hero__sub">{t('fastestPick')}</p>
            </div>
          </section>

          <div className="stats">
            {[
              [4, t('products')],
              [locations.length, t('locations')],
              [bags, t('bags')],
            ].map(([value, label]) => (
              <div key={label} className="surface stat">
                <div className="stat__value">{value}</div>
                <div className="stat__label">{label}</div>
              </div>
            ))}
          </div>

          <section className="surface status-card">
            <h3 className="status-card__title" style={{ margin: 0 }}>{t('productStatus')}</h3>
            <div className="status-card__tags">
              <Tag status="chip-success">{t('nPicked', { n: 4 })}</Tag>
              <Tag status="chip-warning">{t('nPartial', { n: 2 })}</Tag>
              <Tag status="chip-danger">{t('nRemoved', { n: 1 })}</Tag>
            </div>
          </section>

          <div className="surface list-row">
            <span>{t('nProducts', { n: 4 })}</span>
            <IconButton label={t('viewProducts')} icon={<ChevronRight />} className="icon-btn--flat" />
          </div>


          <section className="surface rider" aria-label={t('rider')}>
            <div className="rider__main">
              <p className="rider__name">
                <img src={assets.courier} alt="" />
                Daniel M. - 1234
              </p>
              <Tag status="chip-branded">{t('arrivesIn', { n: 2 })}</Tag>
            </div>
            <div className="rider__actions">
              <IconButton label={t('messageRider')} icon={<ChatEllipsis />} />
              <IconButton label={t('callRider')} icon={<Phone />} />
            </div>
          </section>

          <div className="panel__head summary-locations-head">
            <h3 className="section-label" style={{ margin: 0 }}>{t('locations')}</h3>
            <Indicator status="branded">{locations.length}</Indicator>
          </div>
          {locations.map((loc) => (
            <LocationCard key={loc.code} loc={loc} variant="summary" />
          ))}
        </div>
      </div>
      <div className="screen__cta screen__cta--overlay">
        <Button onClick={onDone}>{t('done')}</Button>
      </div>
    </div>
  );
}
