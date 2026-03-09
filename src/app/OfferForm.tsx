'use client';

import { useState, useEffect } from 'react';
import { generateOffer } from '@/actions';

interface OfferFormProps {
  defaultPrices: Record<string, number>;
  prefill: Record<string, unknown>;
}

export default function OfferForm({ defaultPrices, prefill }: OfferFormProps) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    calculateTotal();
  }, []);

  function calculateTotal() {
    let subtotal = 0;

    const items = [
      ['cable_length', 'cable_unit_price'],
      ['excavation_volume', 'excavation_unit_price'],
      ['trench_length', 'trench_unit_price'],
      ['pipe_length', 'pipe_unit_price'],
      ['backfill_volume', 'backfill_unit_price'],
      ['asphalt_area', 'asphalt_unit_price']
    ];

    items.forEach(([qty, price]) => {
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

  const getValue = (key: string) => {
    if (prefill[key] !== undefined && prefill[key] !== null && prefill[key] !== '') {
      return prefill[key];
    }
    if (key.includes('unit_price')) {
      const priceKey = key.replace('_unit_price', '');
      return defaultPrices[priceKey] || '';
    }
    return '';
  };

  return (
    <form action={generateOffer} id="offerForm" onChange={calculateTotal}>
      <div className="form-section">
        <div className="section-title">👤 Kunde</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input type="text" name="customer_name" defaultValue={getValue('customer_name') as string} required />
          </div>
          <div className="form-group">
            <label>Firma</label>
            <input type="text" name="customer_company" defaultValue={getValue('customer_company') as string} />
          </div>
          <div className="form-group full-width">
            <label>Adresse</label>
            <input type="text" name="customer_address" defaultValue={getValue('customer_address') as string} placeholder="Straße, PLZ, Ort" />
          </div>
          <div className="form-group">
            <label>Telefon</label>
            <input type="tel" name="customer_phone" defaultValue={getValue('customer_phone') as string} />
          </div>
          <div className="form-group">
            <label>E-Mail</label>
            <input type="email" name="customer_email" defaultValue={getValue('customer_email') as string} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">📍 Projekt</div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Projektname *</label>
            <input type="text" name="project_name" defaultValue={getValue('project_name') as string} required />
          </div>
          <div className="form-group full-width">
            <label>Baustelle / Ort</label>
            <input type="text" name="project_location" defaultValue={getValue('project_location') as string} />
          </div>
          <div className="form-group full-width">
            <label>Beschreibung</label>
            <textarea name="project_description" placeholder="Kurze Beschreibung der Arbeiten..." defaultValue={getValue('project_description') as string} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">🔧 Leistungen</div>
        
        <div className="work-item">
          <div className="work-item-header">Kabelverlegung</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Menge (m)</label>
              <input type="number" step="0.01" name="cable_length" defaultValue={getValue('cable_length') as string} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Preis/m (€)</label>
              <input type="number" step="0.01" name="cable_unit_price" defaultValue={getValue('cable_unit_price') as string} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="work-item">
          <div className="work-item-header">Erdaushub</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Menge (m³)</label>
              <input type="number" step="0.01" name="excavation_volume" defaultValue={getValue('excavation_volume') as string} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Preis/m³ (€)</label>
              <input type="number" step="0.01" name="excavation_unit_price" defaultValue={getValue('excavation_unit_price') as string} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="work-item">
          <div className="work-item-header">Grabenherstellung</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Menge (m)</label>
              <input type="number" step="0.01" name="trench_length" defaultValue={getValue('trench_length') as string} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Preis/m (€)</label>
              <input type="number" step="0.01" name="trench_unit_price" defaultValue={getValue('trench_unit_price') as string} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="work-item">
          <div className="work-item-header">Rohrverlegung</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Menge (m)</label>
              <input type="number" step="0.01" name="pipe_length" defaultValue={getValue('pipe_length') as string} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Preis/m (€)</label>
              <input type="number" step="0.01" name="pipe_unit_price" defaultValue={getValue('pipe_unit_price') as string} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="work-item">
          <div className="work-item-header">Verfüllung</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Menge (m³)</label>
              <input type="number" step="0.01" name="backfill_volume" defaultValue={getValue('backfill_volume') as string} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Preis/m³ (€)</label>
              <input type="number" step="0.01" name="backfill_unit_price" defaultValue={getValue('backfill_unit_price') as string} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="work-item">
          <div className="work-item-header">Asphaltarbeiten</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Fläche (m²)</label>
              <input type="number" step="0.01" name="asphalt_area" defaultValue={getValue('asphalt_area') as string} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Preis/m² (€)</label>
              <input type="number" step="0.01" name="asphalt_unit_price" defaultValue={getValue('asphalt_unit_price') as string} placeholder="0.00" />
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-title">⚙️ Zusatzleistungen</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Bodentyp</label>
            <select name="soil_type" defaultValue={getValue('soil_type') as string || 'normal'}>
              <option value="normal">Normaler Boden</option>
              <option value="sandy">Sandiger Boden (+5%)</option>
              <option value="clay">Toniger Boden (+10%)</option>
              <option value="rocky">Felsiger Boden (+15%)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Grabtiefe (m)</label>
            <input type="number" step="0.1" name="excavation_depth" defaultValue={getValue('excavation_depth') as string} placeholder="0" />
            <span className="info-text">Aufschlag ab 1,5m Tiefe</span>
          </div>
          <div className="form-group">
            <label>Geräte</label>
            <input type="text" name="equipment" defaultValue={getValue('equipment') as string} placeholder="z.B. Bagger, LKW" />
          </div>
          <div className="form-group">
            <label>Gerätepreis (€)</label>
            <input type="number" step="0.01" name="equipment_price" defaultValue={getValue('equipment_price') as string} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Arbeiter (Tage)</label>
            <input type="number" name="workers" defaultValue={getValue('workers') as string} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Arbeiterkosten (€)</label>
            <input type="number" step="0.01" name="worker_price" placeholder="0.00" />
          </div>
        </div>
      </div>

      <div className="total-preview">
        <div className="label">Geschätzter Gesamtpreis (inkl. 19% MwSt.)</div>
        <div className="amount" id="totalPreview">{total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
      </div>

      <button type="submit" className="btn btn-primary">
        📄 PDF-Angebot erstellen
      </button>
    </form>
  );
}
