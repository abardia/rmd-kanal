import { getOffer } from '@/lib/db';
import { COMPANY_INFO } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawOffer = await getOffer(id);
  const offer = rawOffer ? {
    ...rawOffer,
    subtotal: Number(rawOffer.subtotal),
    vat: Number(rawOffer.vat),
    total: Number(rawOffer.total),
  } as {
    id: number;
    offer_number: string;
    offer_date: string;
    valid_until: string;
    customer_name: string;
    customer_company: string | null;
    customer_address: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    project_name: string;
    project_location: string | null;
    project_description: string | null;
    work_items_json: string;
    subtotal: number;
    vat: number;
    total: number;
  } : undefined;

  if (!offer) {
    notFound();
  }

  const workItems = JSON.parse(offer.work_items_json).map((item: Record<string, unknown>) => ({
    ...item,
    unit_price: Number(item.unit_price),
    total: Number(item.total),
    quantity: Number(item.quantity),
  }));

  return (
    <main>
      <div className="header">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 no-underline!">
            <span className="text-xl font-bold">R</span>
          </Link>
          <h1>Angebot {offer.offer_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/api/offer/${offer.id}/pdf`} className="nav-link bg-blue-600 text-white! px-5 flex items-center gap-2" download>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            PDF Downloaden
          </Link>
          <Link href="/" className="nav-link">+ Neues Angebot</Link>
        </div>
      </div>

      <div className="container">
        <div className="offer-view">
          <div className="offer-header-section">
            <div>
              <h2>{COMPANY_INFO.name}</h2>
              <p>{COMPANY_INFO.address}</p>
              <p>{COMPANY_INFO.city}</p>
              <p>Tel: {COMPANY_INFO.phone}</p>
              <p>{COMPANY_INFO.email}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3>Angebot Nr.: {offer.offer_number}</h3>
              <p>Datum: {offer.offer_date}</p>
              <p>Gültig bis: {offer.valid_until}</p>
            </div>
          </div>

          <div className="offer-section">
            <h4>Kunde</h4>
            <p><strong>{offer.customer_name}</strong></p>
            {offer.customer_company && <p>{offer.customer_company}</p>}
            {offer.customer_address && <p>{offer.customer_address}</p>}
            {offer.customer_phone && <p>Tel: {offer.customer_phone}</p>}
            {offer.customer_email && <p>E-Mail: {offer.customer_email}</p>}
          </div>

          <div className="offer-section">
            <h4>Projekt</h4>
            <p><strong>{offer.project_name}</strong></p>
            {offer.project_location && <p>Ort: {offer.project_location}</p>}
            {offer.project_description && <p>Beschreibung: {offer.project_description}</p>}
          </div>

          <div className="offer-section">
            <h4>Leistungen</h4>
            <table className="offer-table">
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Beschreibung</th>
                  <th>Menge</th>
                  <th>Einheit</th>
                  <th>Einzelpreis</th>
                  <th>Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {workItems.map((item: { position: number; description: string; quantity: number; unit: string; unit_price: number; total: number }) => (
                  <tr key={item.position}>
                    <td>{item.position}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.unit_price.toFixed(2)} €</td>
                    <td>{item.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="offer-totals">
            <div className="total-row">
              <span>Zwischensumme (netto):</span>
              <span>{offer.subtotal.toFixed(2)} €</span>
            </div>
            <div className="total-row">
              <span>MwSt. 19%:</span>
              <span>{offer.vat.toFixed(2)} €</span>
            </div>
            <div className="total-row total-final">
              <span>Gesamtbetrag (brutto):</span>
              <span>{offer.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
