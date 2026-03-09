import { getOffers } from '@/actions';
import Link from 'next/link';

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <main>
      <div className="header">
        <h1>📋 Angebotsübersicht</h1>
        <Link href="/" className="nav-link" style={{ background: 'var(--accent)' }}>+ Neues Angebot</Link>
      </div>
      <div className="container">
        {offers && (offers as Array<{id: number; offer_number: string; customer_name: string; customer_company: string | null; project_name: string; offer_date: string; total: number}>).length > 0 ? (
          <div className="offers-list">
            {(offers as Array<{id: number; offer_number: string; customer_name: string; customer_company: string | null; project_name: string; offer_date: string; total: number}>).map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-info">
                  <h3>{offer.offer_number}</h3>
                  <p className="customer">{offer.customer_name}{offer.customer_company ? ` - ${offer.customer_company}` : ''}</p>
                  <p>{offer.project_name}</p>
                  <p>Datum: {offer.offer_date}</p>
                </div>
                <div className="offer-meta">
                  <div className="offer-amount">{offer.total.toFixed(2)} €</div>
                    <div className="offer-actions">
                    <Link href={`/api/offer/${offer.id}/pdf`} className="btn btn-view" target="_blank">PDF</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>Noch keine Angebote vorhanden.</p>
            <Link href="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '15px', width: 'auto' }}>Erstes Angebot erstellen</Link>
          </div>
        )}
      </div>
    </main>
  );
}
