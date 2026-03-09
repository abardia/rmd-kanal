'use server';

import { updatePrices as dbUpdatePrices, saveOffer } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
	GoogleGenAI
}
 from '@google/genai';
function safeFloat(value: string | undefined, defaultVal = 0): number { 
  try {
    if (!value || value === '') return defaultVal;
    return parseFloat(value);
  } catch {
    return defaultVal;
  }
}

export async function updatePrices(formData: FormData) {
  await dbUpdatePrices(formData);
  revalidatePath('/prices');
}

export async function generateOffer(formData: FormData) {
  const now = new Date();
  const offerNumber = `AN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.getTime().toString().slice(-6)}`;
  const offerDate = now.toLocaleDateString('de-DE');
  const validUntil = now.toLocaleDateString('de-DE');

  const workItems: Array<{
    position: number;
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total: number;
  }> = [];

  const items = [
    { key: 'cable_length', name: 'Kabelverlegung', qty: formData.get('cable_length'), price: formData.get('cable_length_unit_price'), unit: 'm' },
    { key: 'excavation_volume', name: 'Erdaushub', qty: formData.get('excavation_volume'), price: formData.get('excavation_volume_unit_price'), unit: 'm³' },
    { key: 'trench_length', name: 'Grabenherstellung', qty: formData.get('trench_length'), price: formData.get('trench_length_unit_price'), unit: 'm' },
    { key: 'pipe_length', name: 'Rohrverlegung', qty: formData.get('pipe_length'), price: formData.get('pipe_length_unit_price'), unit: 'm' },
    { key: 'backfill_volume', name: 'Verfüllung', qty: formData.get('backfill_volume'), price: formData.get('backfill_volume_unit_price'), unit: 'm³' },
    { key: 'asphalt_area', name: 'Asphaltarbeiten', qty: formData.get('asphalt_area'), price: formData.get('asphalt_area_unit_price'), unit: 'm²' },
  ];

  let total = 0;
  
  for (const item of items) {
    const qty = safeFloat(item.qty as string | undefined);
    const price = safeFloat(item.price as string | undefined);
    if (qty > 0 && price > 0) {
      const itemTotal = qty * price;
      total += itemTotal;
      workItems.push({
        position: workItems.length + 1,
        description: item.name,
        quantity: qty,
        unit: item.unit,
        unit_price: price,
        total: itemTotal,
      });
    }
  }

  const equipment = formData.get('equipment') as string;
  const equipmentPrice = safeFloat(formData.get('equipment_price') as string | undefined);
  if (equipment && equipmentPrice > 0) {
    total += equipmentPrice;
    workItems.push({
      position: workItems.length + 1,
      description: `Geräte: ${equipment}`,
      quantity: 1,
      unit: 'PA',
      unit_price: equipmentPrice,
      total: equipmentPrice,
    });
  }

  const workers = formData.get('workers') as string;
  const workerPrice = safeFloat(formData.get('worker_price') as string | undefined);
  if (workers && workerPrice > 0) {
    total += workerPrice;
    workItems.push({
      position: workItems.length + 1,
      description: `Arbeiter: ${workers} Mann-Tage`,
      quantity: parseInt(workers) || 0,
      unit: 'MT',
      unit_price: workerPrice / (parseInt(workers) || 1),
      total: workerPrice,
    });
  }

  const soilType = formData.get('soil_type') as string;
  if (soilType && soilType !== 'normal') {
    const surcharge = total * 0.15;
    total += surcharge;
    const soilNames: Record<string, string> = {
      rocky: 'Felsiger Boden (Aufschlag 15%)',
      sandy: 'Sandiger Boden (Aufschlag 5%)',
      clay: 'Toniger Boden (Aufschlag 10%)',
    };
    workItems.push({
      position: workItems.length + 1,
      description: soilNames[soilType] || soilType,
      quantity: 1,
      unit: 'PA',
      unit_price: surcharge,
      total: surcharge,
    });
  }

  const excavationDepth = safeFloat(formData.get('excavation_depth') as string | undefined);
  if (excavationDepth > 1.5) {
    const depthSurcharge = total * ((excavationDepth - 1.5) * 0.1);
    total += depthSurcharge;
    workItems.push({
      position: workItems.length + 1,
      description: 'Erschwerte Grabungsarbeiten (>1.5m Tiefe)',
      quantity: excavationDepth - 1.5,
      unit: 'm',
      unit_price: total * 0.1,
      total: depthSurcharge,
    });
  }

  const subtotal = total;
  const vat = total * 0.19;
  const totalWithVat = total * 1.19;

  await saveOffer({
    offer_number: offerNumber,
    offer_date: offerDate,
    valid_until: validUntil,
    customer_name: formData.get('customer_name') as string || '',
    customer_company: formData.get('customer_company') as string || undefined,
    customer_address: formData.get('customer_address') as string || undefined,
    customer_phone: formData.get('customer_phone') as string || undefined,
    customer_email: formData.get('customer_email') as string || undefined,
    project_name: formData.get('project_name') as string || '',
    project_location: formData.get('project_location') as string || undefined,
    project_description: formData.get('project_description') as string || undefined,
    work_items_json: JSON.stringify(workItems),
    subtotal,
    vat,
    total: totalWithVat,
  });

  revalidatePath('/offers');
  redirect(`/offer/${offerNumber}`);
}

export async function extractWithLLM(text: string) {
  const apikey = process.env.GEMINI_API_KEY;
  

  const prompt = `Extrahiere aus dem folgenden Text alle relevanten Informationen für ein Tiefbau-Angebot und gib das Ergebnis als JSON zurück.

Benötigte Felder:
- customer_name: Name des Kunden
- customer_company: Firmenname (falls vorhanden)
- customer_address: Adresse
- customer_phone: Telefonnummer
- customer_email: E-Mail
- project_name: Projektname
- project_location: Baustelle/Ort
- project_description: Beschreibung der Arbeiten
- cable_length: Kabelverlegung in Meter (falls genannt)
- excavation_volume: Erdaushub in m³ (falls genannt)
- trench_length: Grabenherstellung in Meter (falls genannt)
- pipe_length: Rohrverlegung in Meter (falls genannt)
- backfill_volume: Verfüllung in m³ (falls genannt)
- asphalt_area: Asphaltarbeiten in m² (falls genannt)
- excavation_depth: Grabtiefe in Meter (falls genannt)
- soil_type: Bodentyp (normal, sandy, clay, rocky) falls genannt
- equipment: Geräte (z.B. Bagger, LKW) falls genannt
- workers: Anzahl Arbeitertage falls genannt

Gib nur JSON zurück, ohne zusätzlichen Text. Wenn ein Feld nicht genannt wird, lasse es leer oder null. TEXT: `;
	
    
  const ai = new GoogleGenAI({apiKey: 
  	apikey
  });
  

   const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt + '\n\nText:\n' + text,
    });
  
  const response = result.response.text();

  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim()
  
  return JSON.parse(cleaned);
}
