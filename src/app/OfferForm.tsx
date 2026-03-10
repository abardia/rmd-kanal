'use client';

import { useState, useEffect } from 'react';
import { generateOffer } from '@/actions';

interface OfferFormProps {
  defaultPrices: Record<string, number>;
  prefill: Record<string, unknown>;
}

export default function OfferForm({ defaultPrices, prefill }: OfferFormProps) {
  const [total, setTotal] = useState(0);

  function calculateTotal() {
    let subtotal = 0;

    const itemKeys = [
      { qty: 'cable_length', price: 'cable_length_unit_price' },
      { qty: 'excavation_volume', price: 'excavation_volume_unit_price' },
      { qty: 'trench_length', price: 'trench_length_unit_price' },
      { qty: 'pipe_length', price: 'pipe_length_unit_price' },
      { qty: 'backfill_volume', price: 'backfill_volume_unit_price' },
      { qty: 'asphalt_area', price: 'asphalt_area_unit_price' }
    ];

    itemKeys.forEach(({ qty, price }) => {
      const q = parseFloat((document.querySelector(`[name="${qty}"]`) as HTMLInputElement)?.value) || 0;
      const p = parseFloat((document.querySelector(`[name="${price}"]`) as HTMLInputElement)?.value) || 0;
      subtotal += q * p;
    });

    const equipPrice = parseFloat((document.querySelector('[name="equipment_price"]') as HTMLInputElement)?.value) || 0;
    const workerPrice = parseFloat((document.querySelector('[name="worker_price"]') as HTMLInputElement)?.value) || 0;
    subtotal += equipPrice + workerPrice;

    const soilType = (document.querySelector('[name="soil_type"]') as HTMLSelectElement)?.value;
    if (soilType === 'sandy') subtotal *= 1.05;
    else if (soilType === 'clay') subtotal *= 1.10;
    else if (soilType === 'rocky') subtotal *= 1.15;

    const depth = parseFloat((document.querySelector('[name="excavation_depth"]') as HTMLInputElement)?.value) || 0;
    if (depth > 1.5) {
      subtotal *= (1 + (depth - 1.5) * 0.1);
    }

    setTotal(subtotal * 1.19);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    calculateTotal();
  }, []);

  const getValue = (key: string) => {
    if (prefill[key] !== undefined && prefill[key] !== null && prefill[key] !== '') {
      return prefill[key];
    }
    if (key.endsWith('_unit_price')) {
      const dbKey = key.replace('_unit_price', '');
      return defaultPrices[dbKey] || '';
    }
    return '';
  };

  return (
    <form action={generateOffer} id="offerForm" onChange={calculateTotal} className="pb-24">
      <div className="form-section">
        <div className="section-title">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Kundendetails
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Vollständiger Name *</label>
            <input type="text" name="customer_name" defaultValue={getValue('customer_name') as string} required placeholder="Max Mustermann" />
          </div>
          <div className="form-group">
            <label>Firma (optional)</label>
            <input type="text" name="customer_company" defaultValue={getValue('customer_company') as string} placeholder="Muster GmbH" />
          </div>
          <div className="form-group full-width">
            <label>Anschrift</label>
            <input type="text" name="customer_address" defaultValue={getValue('customer_address') as string} placeholder="Musterstraße 123, 12345 Berlin" />
          </div>
          <div className="form-group">
            <label>Telefon</label>
            <input type="tel" name="customer_phone" defaultValue={getValue('customer_phone') as string} placeholder="+49 000 0000000" />
          </div>
          <div className="form-group">
            <label>E-Mail</label>
            <input type="email" name="customer_email" defaultValue={getValue('customer_email') as string} placeholder="max@mustermann.de" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Projektstandort
        </div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Bezeichnung des Projekts *</label>
            <input type="text" name="project_name" defaultValue={getValue('project_name') as string} required placeholder="z.B. Erschließung Neubaugebiet" />
          </div>
          <div className="form-group full-width">
            <label>Baustelle / Ort</label>
            <input type="text" name="project_location" defaultValue={getValue('project_location') as string} placeholder="Hofgartenweg 1, Hannover" />
          </div>
          <div className="form-group full-width">
            <label>Leistungsbeschreibung</label>
            <textarea name="project_description" placeholder="Detaillierte Aufzählung der geplanten Tätigkeiten..." defaultValue={getValue('project_description') as string} className="min-h-[120px]" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          Leistungsumfang
        </div>
        
        {[
          { dbKey: 'cable_length', label: 'Kabelverlegung', unit: 'm' },
          { dbKey: 'excavation_volume', label: 'Erdaushub', unit: 'm³' },
          { dbKey: 'trench_length', label: 'Grabenherstellung', unit: 'm' },
          { dbKey: 'pipe_length', label: 'Rohrverlegung', unit: 'm' },
          { dbKey: 'backfill_volume', label: 'Verfüllung', unit: 'm³' },
          { dbKey: 'asphalt_area', label: 'Asphaltarbeiten', unit: 'm²' }
        ].map((item) => (
          <div key={item.dbKey} className="work-item group">
            <div className="work-item-header group-hover:text-blue-600 transition-colors">{item.label}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Menge ({item.unit})</label>
                <input type="number" step="0.01" name={item.dbKey} defaultValue={getValue(item.dbKey) as string} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Einzelpreis (€/{item.unit})</label>
                <input type="number" step="0.01" name={`${item.dbKey}_unit_price`} defaultValue={getValue(`${item.dbKey}_unit_price`) as string} placeholder="0.00" className="text-right font-medium" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="section-title">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          Spezifikationen & Ressourcen
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>Bodenbeschaffenheit</label>
            <select name="soil_type" defaultValue={getValue('soil_type') as string || 'normal'}>
              <option value="normal">Normaler Boden (Referenz)</option>
              <option value="sandy">Sandiger Boden (+5%)</option>
              <option value="clay">Toniger Boden (+10%)</option>
              <option value="rocky">Felsiger Boden (+15%)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Maximale Grabtiefe (m)</label>
            <div className="relative">
              <input type="number" step="0.1" name="excavation_depth" defaultValue={getValue('excavation_depth') as string} placeholder="0" />
              {/* <span className="absolute right-3 top-3 text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">Aufschlag ab 1.5m</span> */}
            </div>
            <span className="info-text text-amber-600 font-medium">⚠️ Automatischer Tiefenaufschlag ab 1,5m</span>
          </div>
          <div className="form-group">
            <label>Geräteeinsatz</label>
            <input type="text" name="equipment" defaultValue={getValue('equipment') as string} placeholder="z.B. Minibagger, 3.5t Rüttelplatte" />
          </div>
          <div className="form-group">
            <label>Miet-/Gerätekosten (€)</label>
            <input type="number" step="0.01" name="equipment_price" defaultValue={getValue('equipment_price') as string} placeholder="0.00" className="font-medium" />
          </div>
          <div className="form-group">
            <label>Personalaufwand (Manntage)</label>
            <input type="number" name="workers" defaultValue={getValue('workers') as string} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Gesamte Personalkosten (€)</label>
            <input type="number" step="0.01" name="worker_price" placeholder="0.00" className="font-medium" />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="total-preview border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="label text-white/70">Voraussichtliche Gesamtsumme</div>
              <div className="text-[10px] opacity-50 uppercase tracking-widest text-white/50">inkl. 19% gesetzl. MwSt.</div>
            </div>
            <div className="amount" id="totalPreview">
              {total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </div>
          </div>
          
          <button type="submit" className="btn-primary mt-6">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Angebot als PDF generieren
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
