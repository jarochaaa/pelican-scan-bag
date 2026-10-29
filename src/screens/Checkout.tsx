import { useState } from 'react';
import cola from '../assets/products/coca-cola.png';
import avocado from '../assets/products/avocado.png';
import almonds from '../assets/products/almonds.jpg';
import { useI18n } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { Button, Indicator, Tag } from '../components/ui';
import type { TagStatus } from '../components/ui';

interface Product {
  name: string;
  image: string;
  tags: { status: TagStatus; label: string }[];
}

const PICKED: Product[] = [
  { name: 'Coca-Cola Original 500ml', image: cola, tags: [{ status: 'warning', label: '8/10' }] },
  {
    name: 'Avocado Bio Caribbean Regional flavour',
    image: avocado,
    tags: [
      { status: 'success', label: '2/2' },
      { status: 'success', label: '1,98 kg' },
    ],
  },
  { name: 'Almond Nuts Brandenburg BIO Fruit', image: almonds, tags: [{ status: 'error', label: '0 kg' }] },
];

export function Checkout({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<'to-pick' | 'picked'>('picked');
  const products = tab === 'picked' ? PICKED : [];

  return (
    <div className="screen screen-enter">
      <div className="screen__scroll">
        <PageHeader onLeading={onBack} onInfo={() => {}} timer={{ label: t('minutes', { n: 30 }), tone: 'muted' }} flatButtons />
        <div className="segmented" role="tablist" aria-label={t('productsTabs')}>
          <button type="button" role="tab" className="segmented__item" aria-selected={tab === 'to-pick'} onClick={() => setTab('to-pick')}>
            {t('toPick')} <Indicator status="subtle">0</Indicator>
          </button>
          <button type="button" role="tab" className="segmented__item" aria-selected={tab === 'picked'} onClick={() => setTab('picked')}>
            {t('picked')} <Indicator status="neutral">{PICKED.length}</Indicator>
          </button>
        </div>
        <div className="screen__body" style={{ paddingTop: 8 }}>
          {products.length === 0 && <p className="empty-state">{t('nothingToPick')}</p>}
          {products.map((p) => (
            <article key={p.name} className="product-card">
              <div className="product-card__img">
                <img src={p.image} alt="" />
              </div>
              <div className="product-card__content">
                <p className="product-card__name">{p.name}</p>
                <div className="product-card__tags">
                  {p.tags.map((t) => (
                    <Tag key={t.label} status={t.status}>{t.label}</Tag>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="screen__cta">
        <Button onClick={onContinue}>{t('continueCheckout')}</Button>
      </div>
    </div>
  );
}
