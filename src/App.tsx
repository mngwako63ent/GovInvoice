/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Quote, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  ChevronRight,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileEdit,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceDocument, DocumentType, DocumentStatus, LineItem } from './types';
import { cn, formatCurrency, generateId } from './utils';
import { format, addDays } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Components
import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';
import DocumentPreview from './components/DocumentPreview';

const INITIAL_COMPANY = {
  name: 'GovInvoice Solutions',
  email: 'hello@govinvoice.co.za',
  address: '123 Tech Avenue, Sandton, Johannesburg',
  phone: '+27 11 123 4567',
};

export default function App() {
  const [documents, setDocuments] = useState<InvoiceDocument[]>(() => {
    const saved = localStorage.getItem('gov_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved documents', e);
      }
    }
    
    // Initial mock data if nothing is saved
    return [
      {
        id: '1',
        number: 'INV-8821',
        type: 'invoice',
        status: 'paid',
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
        company: INITIAL_COMPANY,
        client: { name: 'Global Tech Corp', email: 'billing@globaltech.com', address: '45 Innovation Way, Cape Town' },
        items: [{ id: 'i1', description: 'Web Development Services', quantity: 1, price: 15000 }],
        notes: 'Payment due within 14 days.',
        taxRate: 15,
        subtotal: 15000,
        taxAmount: 2250,
        total: 17250,
      },
      {
        id: '2',
        number: 'QUO-4412',
        type: 'quotation',
        status: 'pending',
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        company: INITIAL_COMPANY,
        client: { name: 'Creative Studio', email: 'hello@creativestudio.co.za', address: '12 Art Lane, Durban' },
        items: [{ id: 'i2', description: 'Brand Identity Design', quantity: 1, price: 8500 }],
        notes: 'Quote valid for 30 days.',
        taxRate: 15,
        subtotal: 8500,
        taxAmount: 1275,
        total: 9775,
      }
    ];
  });

  const [view, setView] = useState<'dashboard' | 'create' | 'edit' | 'preview'>('dashboard');
  const [selectedDoc, setSelectedDoc] = useState<InvoiceDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'quotation'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Save to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('gov_documents', JSON.stringify(documents));
  }, [documents]);

  const handleSave = (doc: InvoiceDocument) => {
    if (view === 'edit') {
      setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    } else {
      setDocuments(prev => [doc, ...prev]);
    }
    setView('dashboard');
    setSelectedDoc(null);
  };

  const handleEdit = (doc: InvoiceDocument) => {
    setSelectedDoc(doc);
    setView('edit');
    setIsSidebarOpen(false);
  };

  const handlePreview = (doc: InvoiceDocument) => {
    setSelectedDoc(doc);
    setView('preview');
    setIsSidebarOpen(false);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showNotification('Document deleted successfully');
  };

  const handleDuplicate = (doc: InvoiceDocument) => {
    const newDoc = {
      ...doc,
      id: crypto.randomUUID(),
      number: generateId(doc.type === 'invoice' ? 'INV' : 'QUO'),
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'draft' as DocumentStatus,
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleConvertToInvoice = (doc: InvoiceDocument) => {
    const newDoc: InvoiceDocument = {
      ...doc,
      id: crypto.randomUUID(),
      type: 'invoice',
      number: generateId('INV'),
      status: 'pending',
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    };
    setDocuments(prev => [newDoc, ...prev]);
    showNotification('Quotation converted to Invoice');
    setView('dashboard');
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                          (filter === 'paid' && doc.status === 'paid') ||
                          (filter === 'pending' && doc.status === 'pending') ||
                          (filter === 'quotation' && doc.type === 'quotation');
      
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filter]);

  const SidebarContent = () => (
    <>
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl">
          <FileText className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-black tracking-tighter uppercase">GovInvoice</h1>
      </div>

      <nav className="flex-1 px-4 space-y-3">
        <button 
          onClick={() => {
            setView('dashboard');
            setIsSidebarOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-4 px-6 py-4 rounded-full transition-all font-bold text-sm tracking-wide",
            view === 'dashboard' ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-xl" : "text-slate-500 hover:text-white"
          )}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => {
            setSelectedDoc(null);
            setView('create');
            setIsSidebarOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-4 px-6 py-4 rounded-full transition-all font-bold text-sm tracking-wide",
            view === 'create' ? "bg-white/[0.08] text-white border border-white/[0.1] shadow-xl" : "text-slate-500 hover:text-white"
          )}
        >
          <Plus size={20} />
          <span>Create New</span>
        </button>
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
            MN
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">M. Ngwako</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black truncate">Admin</p>
          </div>
          <LogOut size={16} className="text-slate-500" />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 glass-card m-4 mr-0 flex-col z-30 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 w-72 bg-[#1a1f2b] border-r border-white/10 z-50 lg:hidden flex flex-col"
      >
        <SidebarContent />
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 glass-button"
            >
              <MoreVertical size={20} />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search documents..."
                className="w-full glass-input pl-14"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => showNotification('No new notifications')}
              className="glass-icon-button relative hidden xs:flex"
            >
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#1a1f2b]"></span>
            </button>
            <button 
              onClick={() => {
                setSelectedDoc(null);
                setView('create');
              }}
              className="glass-button-primary"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Document</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-4 left-1/2 z-[100] bg-white text-slate-900 px-8 py-4 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest border border-white/20 backdrop-blur-xl"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-4 sm:hidden">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search documents..."
              className="w-full glass-input pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 lg:pt-0">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Dashboard 
                  documents={filteredDocs} 
                  allDocuments={documents}
                  onEdit={handleEdit}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onConvert={handleConvertToInvoice}
                  onViewAll={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  onFilter={setFilter}
                  activeFilter={filter}
                />
              </motion.div>
            )}

            {(view === 'create' || view === 'edit') && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DocumentForm 
                  initialDoc={selectedDoc}
                  company={INITIAL_COMPANY}
                  onSave={handleSave}
                  onCancel={() => setView('dashboard')}
                />
              </motion.div>
            )}

            {view === 'preview' && selectedDoc && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <DocumentPreview 
                  doc={selectedDoc}
                  onEdit={() => setView('edit')}
                  onBack={() => setView('dashboard')}
                  onConvert={handleConvertToInvoice}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
