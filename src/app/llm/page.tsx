'use client';

import { useState, useRef } from 'react';
import { extractWithLLM } from '@/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

export default function LLMPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Mikrofon konnte nicht gestartet werden. Bitte erlauben Sie den Zugriff.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = () => {
    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Spracherkennung wird von diesem Browser nicht unterstützt. Bitte geben Sie den Text manuell ein.');
      return;
    }

    setIsTranscribing(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev ? `${prev} ${transcript}` : transcript);
      setAudioUrl(null);
      setIsTranscribing(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setError(`Spracherkennung fehlgeschlagen: ${event.error}`);
      setIsTranscribing(false);
    };

    if (audioUrl) {
      fetch(audioUrl)
        .then(res => res.blob())
        .then(blob => {
          const audio = new Audio(audioUrl);
          audio.play();
          setTimeout(() => recognition.start(), 500);
        })
        .catch(() => {
          recognition.start();
        });
    }
  };

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Fehler bei der Extraktion: ${message}`);
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
        <div className="flex items-center gap-2">
          <Link href="/" className="nav-link text-white! hover:bg-white/10">Abbrechen</Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container max-w-3xl pt-20">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
            Powered by Gemini AI
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white!">Text zu Angebot</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Sprechen Sie oder kopieren Sie E-Mails, Gesprächsnotizen oder Projektbeschreibungen hier hinein.
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

            <div className="mt-4 flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                  Aufnehmen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium animate-pulse"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  Stopp
                </button>
              )}

              {audioUrl && (
                <div className="flex items-center gap-3">
                  <audio controls src={audioUrl} className="h-10 w-64" />
                  <button
                    type="button"
                    onClick={transcribeAudio}
                    disabled={isTranscribing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isTranscribing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Transkribiere...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Transkribieren
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioUrl(null)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {isRecording && (
                <span className="text-red-400 font-medium animate-pulse">Aufnahme läuft...</span>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4">
               <button 
                type="submit" 
                className={`apple-button w-full text-lg py-4 flex items-center justify-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
