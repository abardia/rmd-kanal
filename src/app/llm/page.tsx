'use client';

import { useState } from 'react';
import { extractWithLLM } from '@/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LLMPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await extractWithLLM(text);
      const encoded = Buffer.from(JSON.stringify(result)).toString('base64');
      router.push(`/?prefill=${encoded}`);
    } catch (err: any) {
      setError(`Fehler bei der Extraktion: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white!">
      <nav className="header border-white/10 bg-black/40! backdrop-blur-3xl!">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 no-underline!">
            <span className="text-xl font-bold">R</span>
          </Link>
          <div>
            <h1 className="leading-tight text-white!">KI-Assistent</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Intelligente Angebotserstellung</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="nav-link text-white! hover:bg-white/10">Abbrechen</Link>
        </div>
      </nav>

      <div className="container max-w-3xl pt-20">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
            Powered by Gemini AI
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white!">Text zu Angebot</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Kopieren Sie E-Mails, Gesprächsnotizen oder Projektbeschreibungen hier hinein.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pb-24">
          <div className="glass-dark border-white/5! p-8 rounded-[32px] shadow-2xl">
            <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase text-xs tracking-widest">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Eingabequelle
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Beispiel: Anfrage von Bau-Service West. Verlegung von 150m Erdkabel in München, Tiefe 1m. Zusätzlich 20m³ Aushub und anschließende Asphaltierung von 10m²..."
                className="min-h-[300px] bg-white/5! border-white/10! text-white! placeholder:text-gray-600! focus:border-blue-500/50! focus:ring-blue-500/10! rounded-2xl text-lg transition-all"
                disabled={loading}
              />
            </div>

            <div className="mt-8 flex flex-col gap-4">
               <button 
                type="submit" 
                className={`apple-button w-full text-lg py-4 flex items-center justify-center gap-3 shadow-blue-500/20 shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extrahiere Daten...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Analyse starten
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-500">
                Die KI erkennt automatisch Mengen, Leistungen und Kundendaten.
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
