export type DocumentType = 'invoice' | 'quotation';
export type DocumentStatus = 'draft' | 'pending' | 'paid' | 'unpaid' | 'overdue';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CompanyDetails {
  name: string;
  email: string;
  address: string;
  phone: string;
  logo?: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  address: string;
}

export interface InvoiceDocument {
  id: string;
  number: string;
  type: DocumentType;
  status: DocumentStatus;
  issueDate: string;
  dueDate: string;
  company: CompanyDetails;
  client: ClientDetails;
  items: LineItem[];
  notes: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}
