
import { getPricesData } from '@/actions';
import OfferForm from './OfferForm';

export default async function Home({ searchParams }: { searchParams: Promise<{ prefill?: string }> }) {
  const params = await searchParams;
  const prices = await getPricesData();
  
  const defaultPrices: Record<string, number> = {};
  for (const p of prices as { item_key: string; default_price: number }[]) {
    defaultPrices[p.item_key] = p.default_price;
  }

  let prefill: Record<string, unknown> = {};
  if (params.prefill) {
    try {
      prefill = JSON.parse(Buffer.from(params.prefill, 'base64').toString());
    } catch {}
  }

  return (
    <main>
      <div className="header">
        <div>
          <h1>🏗️ Tiefbau Angebot
            {Object.keys(prefill).length > 0 && <span className="prefill-badge">KI-vorausgefüllt</span>}
          </h1>
          <p>Erstellen Sie schnell ein professionelles Angebot</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/prices" className="nav-link">💰 Preise</a>
          <a href="/llm" className="nav-link">🤖 KI-Modus</a>
          <a href="/offers" className="nav-link">📋 Alle Angebote</a>
        </div>
      </div>

      <div className="container">
        <OfferForm defaultPrices={defaultPrices} prefill={prefill} />
      </div>
    </main>
  );
}
