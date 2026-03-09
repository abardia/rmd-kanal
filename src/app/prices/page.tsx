import { getPrices, updatePrices } from '@/actions';
import { PriceListItem } from '@/types';
import Link from 'next/link';

export default async function PricesPage() {
  const pricesRaw = await getPrices();
  const prices = (pricesRaw as PriceListItem[]) || [];

  return (
    <main>
      <nav className="header">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 no-underline!">
            <span className="text-xl font-bold">R</span>
          </Link>
          <div>
            <h1 className="leading-tight">Preisliste</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Konfiguration der Standardpreise</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="nav-link">Abbrechen</Link>
        </div>
      </nav>

      <div className="container max-w-2xl pt-12">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight">Globale Standards</h2>
          <p className="text-gray-500 text-sm">Diese Preise werden als Standardwerte für neue Angebote verwendet.</p>
        </div>

        <form action={updatePrices} className="pb-20">
          <div className="form-section">
            <div className="section-title">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Standardtarife
            </div>
            
            <div className="divide-y divide-black/5">
              {prices.map((price) => (
                <div key={price.id} className="price-row group">
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{price.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{price.unit}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-300">€</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      name={`price_${price.item_key}`} 
                      defaultValue={price.default_price.toFixed(2)} 
                      className="w-24 text-right font-black text-blue-600 bg-black/5 border-none focus:ring-2 focus:ring-blue-500/20 py-2 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fixed bottom-8 left-0 right-0 z-50 px-4">
             <div className="max-w-2xl mx-auto">
               <button type="submit" className="btn-primary shadow-2xl">
                 <span className="flex items-center justify-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                   Preiskonfiguration speichern
                 </span>
               </button>
             </div>
          </div>
        </form>
      </div>
    </main>
  );
}
