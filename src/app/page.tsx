
import { getPrices, getDefaultPrices } from '@/lib/db';
import OfferForm from './OfferForm';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default async function Home({ searchParams }: { searchParams: Promise<{ prefill?: string }> }) {
  const params = await searchParams;
  let pricesRaw = await getPrices();
  if (!pricesRaw || pricesRaw.length === 0) {
    pricesRaw = getDefaultPrices().map(p => ({ ...p, id: 0, name: p.item_key, unit: 'm' }));
  }
  const prices: Array<{ item_key: string; default_price: number }> = pricesRaw as Array<{ item_key: string; default_price: number }>;
  
  const defaultPrices: Record<string, number> = {};
  for (const p of prices) {
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
      <nav className="header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span className="text-xl font-bold">R</span>
          </div>
          <div>
            <h1 className="leading-tight">Tiefbau-Manager
              {Object.keys(prefill).length > 0 && <span className="prefill-badge">KI-vorausgefüllt</span>}
            </h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">RMD Kanaltechnik</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/offers" className="nav-link">Angebote</Link>
          <Link href="/prices" className="nav-link">Preise</Link>
          <Link href="" className="nav-link bg-black text-white! dark:bg-white dark:text-black! px-5">KI-Modus</Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container max-w-4xl pt-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Neues Angebot erstellen</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Präzise Kalkulationen und professionelle PDFs in Sekunden.</p>
        </div>
        
        <OfferForm defaultPrices={defaultPrices} prefill={prefill} />
      </div>
    </main>
  );
}
