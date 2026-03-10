import { db } from './firebase';
import { collection, getDocs, doc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';

export async function getPrices() {
  try {
    const pricesRef = collection(db, 'price_list');
    const q = query(pricesRef, orderBy('id'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getDefaultPrices();
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      await setDoc(doc(db, 'price_list', key), {
        item_key: key,
        name: getPriceName(key),
        unit: getPriceUnit(key),
        default_price: parseFloat(price as string),
      }, { merge: true });
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
    const offersRef = collection(db, 'offers');
    const q = query(offersRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('getOffers error:', err);
    return [];
  }
}

export async function getOffer(id: number | string) {
  try {
    if (typeof id === 'string' && id.startsWith('AN-')) {
      const offersRef = collection(db, 'offers');
      const q = query(offersRef);
      const snapshot = await getDocs(q);
      const found = snapshot.docs.find(doc => doc.data().offer_number === id);
      return found ? { id: found.id, ...found.data() } : null;
    }
    const docRef = doc(db, 'offers', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
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
  const offerData = {
    ...offer,
    created_at: new Date().toISOString(),
  };
  await setDoc(doc(db, 'offers', offer.offer_number), offerData);
}
