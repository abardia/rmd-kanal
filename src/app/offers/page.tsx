import { getOffers } from '@/lib/db';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

export default async function OffersPage() {
  const offersRaw = await getOffers();
  const offers = (offersRaw as Array<{
    id: number; 
    offer_number: string; 
    customer_name: string; 
    customer_company: string | null; 
    project_name: string; 
    offer_date: string; 
    total: number
  }>) || [];

  return (
    <main>
      <nav className="header">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 no-underline!">
            <span className="text-xl font-bold">R</span>
          </Link>
          <div>
            <h1 className="leading-tight">Angebotsübersicht</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Alle gespeicherten Projekte</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="nav-link bg-blue-600 text-white! px-5">+ Neues Angebot</Link>
          <Link href="/prices" className="nav-link">Preise</Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container max-w-4xl pt-12">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Archiv</h2>
            <p className="text-gray-500">Verwalten Sie Ihre bisherigen Kalkulationen.</p>
          </div>
          <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {offers.length} Angebote
          </div>
        </div>

        {offers.length > 0 ? (
          <div className="offers-list">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-card group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {offer.offer_number}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{offer.offer_date}</span>
                  </div>
                  <h3 className="group-hover:text-blue-600 transition-colors">{offer.customer_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {offer.project_name}
                  </div>
                  {offer.customer_company && (
                    <div className="text-[11px] text-gray-400 mt-1 italic">{offer.customer_company}</div>
                  )}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Gesamt</div>
                    <div className="text-xl font-black text-gray-900">
                      {offer.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>
                  <Link 
                    href={`/api/offer/${offer.id}/pdf`} 
                    className="w-12 h-12 glass flex items-center justify-center rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                    download
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-16 text-center border-dashed border-2 border-gray-200 bg-transparent shadow-none">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Keine Angebote gefunden</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Sie haben noch keine Angebote erstellt. Fangen Sie jetzt damit an!</p>
            <Link href="/" className="apple-button inline-block">Erstes Angebot erstellen</Link>
          </div>
        )}
      </div>
    </main>
  );
}
