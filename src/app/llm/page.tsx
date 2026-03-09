'use client';

import { useState } from 'react';
import { extractWithLLM } from '@/actions';
import { useRouter } from 'next/navigation';

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
    } catch (err) {
      setError(`Fehler bei der Extraktion: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="header">
        <div>
          <h1>🤖 KI-Modus</h1>
          <p>Text automatisch in Angebot umwandeln</p>
        </div>
        <a href="/" className="nav-link">Zurück</a>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-title">📝 Text eingeben</div>
            <p style={{ marginBottom: '15px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Fügen Sie einen Text ein (z.B. E-Mail, Notiz, Projektbeschreibung). 
              Die KI extrahiert automatisch alle relevanten Informationen.
            </p>
            
            {error && <div className="flash" style={{ background: '#fee', borderColor: '#ecc', color: '#c00' }}>{error}</div>}
            
            <div className="form-group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Beispiel: Herr Müller von der Baugesellschaft XYZ möchte ein Angebot für die Kabelverlegung von 200m in der Hauptstraße 5 in Hannover. Die Grabtiefe soll ca. 1,2m sein..."
                style={{ minHeight: '200px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Wird analysiert...' : '🔍 Informationen extrahieren'}
          </button>
        </form>
      </div>
    </main>
  );
}
