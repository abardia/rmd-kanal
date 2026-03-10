import Database from 'better-sqlite3';
import path from 'path';
import { neon } from '@neondatabase/serverless'
const dbPath = path.resolve(process.cwd(), 'offers.db');
const db = new Database(dbPath);

export async function getPrices() {
  try {
    const rows = db.prepare('SELECT * FROM price_list ORDER BY id').all();
    return rows;
  } catch {
    return getDefaultPrices();
  }
}

export async function updatePrices(formData: FormData) {
  const keys = [
    'cable_length', 'excavation_volume', 'trench_length',
    'pipe_length', 'backfill_volume', 'asphalt_area'
  ];
  
  const insert = db.prepare(`
    INSERT INTO price_list (item_key, name, unit, default_price)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (item_key) DO UPDATE SET default_price = excluded.default_price
  `);
  
  const transaction = db.transaction(() => {
    for (const key of keys) {
      const price = formData.get(`price_${key}`);
      if (price) {
        insert.run(key, getPriceName(key), getPriceUnit(key), parseFloat(price as string));
      }
    }
  });
  
  transaction();
}

function getPriceName(key: string): string {
  const names: Record<string, string> = {
    cable_length: 'Kabelverlegung',
    excavation_volume: 'Erdaushub',
    trench_length: 'Grabenherstellung',
    pipe_length: 'Rohrverlegung',
    backfill_volume: 'Verfüllung',
    asphalt_area: 'Asphaltarbeiten',
  };
  return names[key] || key;
}

function getPriceUnit(key: string): string {
  const units: Record<string, string> = {
    cable_length: 'm',
    excavation_volume: 'm³',
    trench_length: 'm',
    pipe_length: 'm',
    backfill_volume: 'm³',
    asphalt_area: 'm²',
  };
  return units[key] || '';
}

export function getDefaultPrices(): Array<{ item_key: string; default_price: number }> {
  return [
    { item_key: 'cable_length', default_price: 25.00 },
    { item_key: 'excavation_volume', default_price: 35.00 },
    { item_key: 'trench_length', default_price: 45.00 },
    { item_key: 'pipe_length', default_price: 55.00 },
    { item_key: 'backfill_volume', default_price: 28.00 },
    { item_key: 'asphalt_area', default_price: 65.00 },
  ];
}

export async function getOffers() {
  try {
    const rows = db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all();
    return rows;
  } catch (err) {
    console.error('getOffers error:', err);
    return [];
  }
}

export async function getOffer(id: number | string) {
  try {
    // Check if id is offer_number or id
    if (typeof id === 'string' && id.startsWith('AN-')) {
       return db.prepare('SELECT * FROM offers WHERE offer_number = ?').get(id);
    }
    return db.prepare('SELECT * FROM offers WHERE id = ?').get(id);
  } catch (err) {
    console.error('getOffer error:', err);
    return null;
  }
}

export async function saveOffer(offer: {
  offer_number: string;
  offer_date: string;
  valid_until: string;
  customer_name: string;
  customer_company?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  project_name: string;
  project_location?: string;
  project_description?: string;
  work_items_json: string;
  subtotal: number;
  vat: number;
  total: number;
}) {
  const insert = db.prepare(`
    INSERT INTO offers (
      offer_number, offer_date, valid_until,
      customer_name, customer_company, customer_address, customer_phone, customer_email,
      project_name, project_location, project_description,
      work_items_json, subtotal, vat, total
    ) VALUES (
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?
    )
  `);
  
  insert.run(
    offer.offer_number, offer.offer_date, offer.valid_until,
    offer.customer_name, offer.customer_company, offer.customer_address, offer.customer_phone, offer.customer_email,
    offer.project_name, offer.project_location, offer.project_description,
    offer.work_items_json, offer.subtotal, offer.vat, offer.total
  );
}
