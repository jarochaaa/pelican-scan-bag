import type { Loc } from '../state';
import { totalBags, ORDER_ID } from '../state';
import { ChatEllipsis, ChevronRight, Phone, assets } from '../components/icons';
import { LocationCard } from '../components/LocationCard';
import { PageHeader } from '../components/PageHeader';
import { Button, IconButton, Tag } from '../components/ui';

export function SummaryScreen({ locations, onDone }: { locations: Loc[]; onDone: () => void }) {
  const bags = totalBags(locations);

  return (
    <div className="screen screen-enter">
      <div className="screen__scroll">
        <PageHeader leading="none" />
        <div className="summary" style={{ paddingTop: 0 }}>
          <section className="surface hero">
            <img src={assets.trophy} alt="" />
            <div>
              <h2 className="hero__title">{ORDER_ID} Order Completed</h2>
              <p className="hero__sub">Your fastest pick today. Nice work!</p>
            </div>
          </section>

          <div className="stats">
            {[
              [4, 'Products'],
              [locations.length, 'Locations'],
              [bags, 'Bags'],
            ].map(([value, label]) => (
              <div key={label} className="surface stat">
                <div className="stat__value">{value}</div>
                <div className="stat__label">{label}</div>
              </div>
            ))}
          </div>

          <section className="surface status-card">
            <h3 className="status-card__title" style={{ margin: 0 }}>Product status</h3>
            <div className="status-card__tags">
              <Tag status="chip-success">4 Picked</Tag>
              <Tag status="chip-warning">2 Partially Picked</Tag>
              <Tag status="chip-danger">1 Removed</Tag>
            </div>
          </section>

          <div className="surface list-row">
            <span>4 products</span>
            <IconButton label="View products" icon={<ChevronRight />} className="icon-btn--flat" />
          </div>

          <p className="section-label">Rider Handoff: Order placed in {locations.length} {locations.length === 1 ? 'Location' : 'Locations'}</p>

          <section className="surface rider" aria-label="Rider">
            <div className="rider__main">
              <p className="rider__name">
                <img src={assets.courier} alt="" />
                Daniel M. - 1234
              </p>
              <Tag status="chip-branded">Arrives in 2 min</Tag>
            </div>
            <div className="rider__actions">
              <IconButton label="Message rider" icon={<ChatEllipsis />} />
              <IconButton label="Call rider" icon={<Phone />} />
            </div>
          </section>

          {locations.map((loc) => (
            <LocationCard key={loc.code} loc={loc} variant="summary" />
          ))}
        </div>
      </div>
      <div className="screen__cta screen__cta--overlay">
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
