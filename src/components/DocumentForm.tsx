import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronDown,
  Building2,
  User,
  Calendar,
  FileText,
  Quote,
  Info
} from 'lucide-react';
import { InvoiceDocument, DocumentType, DocumentStatus, LineItem, CompanyDetails } from '../types';
import { cn, generateId, formatCurrency } from '../utils';
import { format, addDays } from 'date-fns';

interface DocumentFormProps {
  initialDoc: InvoiceDocument | null;
  company: CompanyDetails;
  onSave: (doc: InvoiceDocument) => void;
  onCancel: () => void;
}

export default function DocumentForm({ initialDoc, company, onSave, onCancel }: DocumentFormProps) {
  const [type, setType] = useState<DocumentType>(initialDoc?.type || 'invoice');
  const [number, setNumber] = useState(initialDoc?.number || generateId(type === 'invoice' ? 'INV' : 'QUO'));
  const [status, setStatus] = useState<DocumentStatus>(initialDoc?.status || 'draft');
  const [issueDate, setIssueDate] = useState(initialDoc?.issueDate || format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(initialDoc?.dueDate || format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  
  const [client, setClient] = useState(initialDoc?.client || { name: '', email: '', address: '' });
  const [items, setItems] = useState<LineItem[]>(initialDoc?.items || [
    { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }
  ]);
  const [notes, setNotes] = useState(initialDoc?.notes || '');
  const [taxRate, setTaxRate] = useState(initialDoc?.taxRate || 15);

  // Update number when type changes (only if it's a new doc)
  useEffect(() => {
    if (!initialDoc) {
      setNumber(generateId(type === 'invoice' ? 'INV' : 'QUO'));
    }
  }, [type, initialDoc]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => {
    const q = isNaN(item.quantity) ? 0 : item.quantity;
    const p = isNaN(item.price) ? 0 : item.price;
    return acc + (q * p);
  }, 0);
  const tr = isNaN(taxRate) ? 0 : taxRate;
  const taxAmount = (subtotal * tr) / 100;
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc: InvoiceDocument = {
      id: initialDoc?.id || crypto.randomUUID(),
      number,
      type,
      status,
      issueDate,
      dueDate,
      company,
      client,
      items,
      notes,
      taxRate,
      subtotal,
      taxAmount,
      total,
    };
    onSave(doc);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{initialDoc ? 'Edit' : 'Create'} {type === 'invoice' ? 'Invoice' : 'Quotation'}</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button type="button" onClick={onCancel} className="flex-1 sm:flex-none glass-button flex items-center justify-center gap-2">
            <X size={18} />
            <span>Cancel</span>
          </button>
          <button type="submit" className="flex-1 sm:flex-none glass-button-primary flex items-center justify-center gap-2">
            <Save size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Document Settings */}
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <Info size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Document Info</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium">Document Type</label>
                <div className="flex p-1 bg-white/[0.03] rounded-full border border-white/[0.08]">
                  <button 
                    type="button"
                    onClick={() => setType('invoice')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      type === 'invoice' ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
                    )}
                  >
                    <FileText size={14} />
                    Invoice
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('quotation')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                      type === 'quotation' ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
                    )}
                  >
                    <Quote size={14} />
                    Quotation
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 font-medium">Document Number</label>
                <input 
                  type="text" 
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full glass-input"
                  placeholder="INV-0001"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Issue Date</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="date" 
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full glass-input pl-14"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full glass-input pl-14"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Client Details</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Client Name</label>
                <input 
                  type="text" 
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  className="w-full glass-input"
                  placeholder="Acme Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Client Email</label>
                <input 
                  type="email" 
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  className="w-full glass-input"
                  placeholder="billing@acme.com"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Client Address</label>
                <textarea 
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                  className="w-full glass-input min-h-[100px] rounded-[1.5rem]"
                  placeholder="123 Client St, Business Park"
                  required
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Line Items</span>
              </div>
              <button 
                type="button" 
                onClick={addItem}
                className="glass-button py-2 px-4 text-[10px] font-black uppercase tracking-widest"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-6 items-start md:items-center p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/[0.05] group transition-all hover:bg-white/[0.04]">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-2">Description</label>
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold placeholder:font-normal"
                      placeholder="Service or product description"
                      required
                    />
                  </div>
                  <div className="w-full md:w-24 space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold md:hidden">Qty</label>
                    <input 
                      type="number" 
                      value={isNaN(item.quantity) ? '' : item.quantity}
                      onChange={(e) => {
                        const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
                        updateItem(item.id, 'quantity', val);
                      }}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-center md:text-left"
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold md:hidden">Price</label>
                    <input 
                      type="number" 
                      value={isNaN(item.price) ? '' : item.price}
                      onChange={(e) => {
                        const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
                        updateItem(item.id, 'price', val);
                      }}
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-center md:text-left"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="w-full md:w-32 text-right font-bold text-sm">
                    {formatCurrency((isNaN(item.quantity) ? 0 : item.quantity) * (isNaN(item.price) ? 0 : item.price))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Notes */}
        <div className="space-y-8">
          <div className="glass-card p-8 space-y-8 sticky top-8">
            <div className="space-y-6">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tax Rate (%)</span>
                  <input 
                    type="number" 
                    value={isNaN(taxRate) ? '' : taxRate}
                    onChange={(e) => {
                      const val = e.target.value === '' ? NaN : parseFloat(e.target.value);
                      setTaxRate(val);
                    }}
                    className="w-20 glass-input py-2 px-3 text-xs text-center"
                  />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">{formatCurrency(isNaN(taxAmount) ? 0 : taxAmount)}</span>
              </div>
              <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Total Amount</span>
                <span className="text-4xl font-black text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Status</label>
              <div className="relative">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                  className="w-full glass-input appearance-none cursor-pointer font-bold"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Notes & Terms</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full glass-input min-h-[150px] text-sm rounded-[1.5rem]"
                placeholder="Payment terms, bank details, or additional info..."
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
