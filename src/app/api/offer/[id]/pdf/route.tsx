import { NextRequest, NextResponse } from 'next/server';
import { getOffer } from '@/lib/db';
import { COMPANY_INFO } from '@/types';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface OfferData {
  offer_number: string;
  offer_date: string;
  valid_until: string;
  customer_name: string;
  customer_company: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  project_name: string;
  project_location: string | null;
  project_description: string | null;
  work_items_json: string;
  subtotal: number;
  vat: number;
  total: number;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { marginBottom: 30, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#1e3a5f' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  companyInfo: {},
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#1e3a5f' },
  companyText: { fontSize: 10, marginTop: 5 },
  headerRight: { textAlign: 'right' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e3a5f' },
  headerDate: { fontSize: 10, marginTop: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 5 },
  
  // Table styles
  table: { width: '100%', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a5f', borderBottomWidth: 1, borderBottomColor: '#1e3a5f' },
  tableHeaderCell: { padding: 8, color: 'white', fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e6ed' },
  tableCell: { padding: 8, fontSize: 9 },
  
  colPos: { width: '10%' },
  colDesc: { width: '40%' },
  colQty: { width: '10%', textAlign: 'right' },
  colUnit: { width: '10%' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },

  totalsSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 2, borderTopColor: '#1e3a5f' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e6ed' },
});

const OfferPDF = ({ offer, workItems }: { offer: OfferData; workItems: Array<{ position: number; description: string; quantity: number; unit: string; unit_price: number; total: number }> }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.companyText}>{COMPANY_INFO.address}</Text>
            <Text style={styles.companyText}>{COMPANY_INFO.city}</Text>
            <Text style={styles.companyText}>Tel: {COMPANY_INFO.phone}</Text>
            <Text style={styles.companyText}>{COMPANY_INFO.email}</Text>
            <Text style={styles.companyText}>USt-IdNr.: {COMPANY_INFO.ust_id}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Angebot Nr.: {offer.offer_number}</Text>
            <Text style={styles.headerDate}>Datum: {offer.offer_date}</Text>
            <Text style={styles.headerDate}>Gültig bis: {offer.valid_until}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kunde</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{offer.customer_name}</Text>
        {offer.customer_company && <Text style={{ fontSize: 10 }}>{offer.customer_company}</Text>}
        {offer.customer_address && <Text style={{ fontSize: 10 }}>{offer.customer_address}</Text>}
        {offer.customer_phone && <Text style={{ fontSize: 10 }}>Tel: {offer.customer_phone}</Text>}
        {offer.customer_email && <Text style={{ fontSize: 10 }}>E-Mail: {offer.customer_email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projekt</Text>
        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{offer.project_name}</Text>
        {offer.project_location && <Text style={{ fontSize: 10 }}>Ort: {offer.project_location}</Text>}
        {offer.project_description && <Text style={{ fontSize: 10 }}>Beschreibung: {offer.project_description}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leistungen</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colPos]}>Pos.</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Beschreibung</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Menge</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Einheit</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Einzelpreis</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Gesamt</Text>
          </View>
          {workItems.map((item) => (
            <View key={item.position} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colPos]}>{item.position}</Text>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{item.unit_price.toFixed(2)} €</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{item.total.toFixed(2)} €</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={{ fontSize: 10 }}>Zwischensumme (netto):</Text>
          <Text style={{ fontSize: 10 }}>{offer.subtotal.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={{ fontSize: 10 }}>MwSt. 19%:</Text>
          <Text style={{ fontSize: 10 }}>{offer.vat.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalFinal}>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Gesamtbetrag (brutto):</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e3a5f' }}>{offer.total.toFixed(2)} €</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const offerRaw = await getOffer(id);
  
  if (!offerRaw) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  }

  const offer = offerRaw as unknown as OfferData;

  const workItems = JSON.parse(offer.work_items_json).map((item: Record<string, unknown>) => ({
    ...item,
    unit_price: Number(item.unit_price),
    total: Number(item.total),
    quantity: Number(item.quantity),
  }));

  try {
    const pdfBuffer = await renderToBuffer(<OfferPDF offer={offer} workItems={workItems} />);
    
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="Angebot_${offer.offer_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
