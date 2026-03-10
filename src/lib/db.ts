import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const sql = neon(databaseUrl);

export async function getPrices() {
  try {
    const rows = await sql`SELECT * FROM price_list ORDER BY id`;
    if (rows.length === 0) {
      return getDefaultPrices();
    }
    return rows.map((row: Record<string, unknown>) => ({
      ...row,
      default_price: Number(row.default_price),
    }));
  } catch {
    return getDefaultPrices();
  }
}

export async function updatePrices(formData: FormData) {
  const keys = [
    'cable_length', 'excavation_volume', 'trench_length',
    'pipe_length', 'backfill_volume', 'asphalt_area'
  ];
  
  for (const key of keys) {
    const price = formData.get(`price_${key}`);
    if (price) {
      await sql`
        INSERT INTO price_list (item_key, name, unit, default_price)
        VALUES (${key}, ${getPriceName(key)}, ${getPriceUnit(key)}, ${parseFloat(price as string)})
        ON CONFLICT (item_key) DO UPDATE SET default_price = ${parseFloat(price as string)}
      `;
    }
  }
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
    const rows = await sql`
      SELECT * FROM offers ORDER BY created_at DESC
    `;
    return rows.map((row: Record<string, unknown>) => ({
      ...row,
      offer_date: row.offer_date instanceof Date ? row.offer_date.toISOString().split('T')[0] : row.offer_date,
      valid_until: row.valid_until instanceof Date ? row.valid_until.toISOString().split('T')[0] : row.valid_until,
      subtotal: Number(row.subtotal),
      vat: Number(row.vat),
      total: Number(row.total),
    }));
  } catch (err) {
    console.error('getOffers error:', err);
    return [];
  }
}

export async function getOffer(id: number | string): Promise<Record<string, unknown> | null> {
  try {
    const idStr = String(id);
    let rows;
    if (idStr.startsWith('AN-')) {
      rows = await sql`SELECT * FROM offers WHERE offer_number = ${idStr}`;
    } else {
      rows = await sql`SELECT * FROM offers WHERE id = ${id}`;
    }
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      offer_date: row.offer_date instanceof Date ? row.offer_date.toISOString().split('T')[0] : row.offer_date,
      valid_until: row.valid_until instanceof Date ? row.valid_until.toISOString().split('T')[0] : row.valid_until,
      subtotal: Number(row.subtotal),
      vat: Number(row.vat),
      total: Number(row.total),
    };
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
  await sql`
    INSERT INTO offers (
      offer_number, offer_date, valid_until, customer_name, 
      customer_company, customer_address, customer_phone, customer_email,
      project_name, project_location, project_description,
      work_items_json, subtotal, vat, total, created_at
    ) VALUES (
      ${offer.offer_number}, ${offer.offer_date}, ${offer.valid_until}, ${offer.customer_name},
      ${offer.customer_company || null}, ${offer.customer_address || null}, ${offer.customer_phone || null}, ${offer.customer_email || null},
      ${offer.project_name}, ${offer.project_location || null}, ${offer.project_description || null},
      ${offer.work_items_json}, ${offer.subtotal}, ${offer.vat}, ${offer.total}, ${new Date().toISOString()}
    )
    ON CONFLICT (offer_number) DO UPDATE SET
      offer_date = ${offer.offer_date},
      valid_until = ${offer.valid_until},
      customer_name = ${offer.customer_name},
      customer_company = ${offer.customer_company || null},
      customer_address = ${offer.customer_address || null},
      customer_phone = ${offer.customer_phone || null},
      customer_email = ${offer.customer_email || null},
      project_name = ${offer.project_name},
      project_location = ${offer.project_location || null},
      project_description = ${offer.project_description || null},
      work_items_json = ${offer.work_items_json},
      subtotal = ${offer.subtotal},
      vat = ${offer.vat},
      total = ${offer.total}
  `;
}
