import { getPrices, updatePrices } from '@/actions';
import { PriceListItem } from '@/types';

export default async function PricesPage() {
  const prices = await getPrices() as PriceListItem[];

  return (
    <main>
      <div className="header">
        <div>
          <h1>💰 Preisliste</h1>
          <p>Standard-Preise für Angebote</p>
        </div>
        <a href="/" className="nav-link">Zurück</a>
      </div>

      <div className="container">
        <form action={updatePrices}>
          <div className="form-section">
            <div className="section-title">Leistungen</div>
            
            {prices.map((price: { id: number; item_key: string; name: string; unit: string; default_price: number }) => (
              <div key={price.id} className="price-row">
                <div className="name">{price.name}</div>
                <div className="unit">{price.unit}</div>
                <input 
                  type="number" 
                  step="0.01" 
                  name={`price_${price.item_key}`} 
                  defaultValue={price.default_price.toFixed(2)} 
                />
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary">
            💾 Preise speichern
          </button>
        </form>
      </div>
    </main>
  );
}
