export interface WorkItem {
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export interface Customer {
  name: string;
  company?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Project {
  name: string;
  location?: string;
  description?: string;
}

export interface Offer {
  id: number;
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
  created_at: string;
}

export interface PriceListItem {
  id: number;
  item_key: string;
  name: string;
  unit: string;
  default_price: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  ust_id: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: "RMD Kanaltechnik GmbH",
  address: "Weiherstr. 4",
  city: "Floersheim",
  phone: "0614531877",
  email: "info@rmd-kanal.de",
  ust_id: "DE175749678",
};

export interface OfferFormData {
  customer_name: string;
  customer_company?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  project_name: string;
  project_location?: string;
  project_description?: string;
  cable_length?: string;
  cable_unit_price?: string;
  excavation_volume?: string;
  excavation_unit_price?: string;
  trench_length?: string;
  trench_unit_price?: string;
  pipe_length?: string;
  pipe_unit_price?: string;
  backfill_volume?: string;
  backfill_unit_price?: string;
  asphalt_area?: string;
  asphalt_unit_price?: string;
  soil_type?: string;
  excavation_depth?: string;
  equipment?: string;
  equipment_price?: string;
  workers?: string;
  worker_price?: string;
}
