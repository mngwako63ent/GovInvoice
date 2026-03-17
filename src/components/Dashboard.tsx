import React from 'react';
import { 
  FileText, 
  Quote, 
  MoreVertical, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Copy,
  Trash2,
  FileEdit,
  ArrowRightLeft,
  Eye
} from 'lucide-react';
import { InvoiceDocument, DocumentStatus } from '../types';
import { cn, formatCurrency } from '../utils';

interface DashboardProps {
  documents: InvoiceDocument[]; // Filtered documents for the list
  allDocuments: InvoiceDocument[]; // All documents for stats calculation
  onEdit: (doc: InvoiceDocument) => void;
  onPreview: (doc: InvoiceDocument) => void;
  onDelete: (id: string) => void;
  onDuplicate: (doc: InvoiceDocument) => void;
  onConvert: (doc: InvoiceDocument) => void;
  onViewAll?: () => void;
  onFilter?: (filter: 'all' | 'paid' | 'pending' | 'quotation') => void;
  activeFilter?: string;
}

const StatusBadge = ({ status }: { status: DocumentStatus }) => {
  const styles = {
    paid: "bg-emerald-500/5 text-emerald-500 border-emerald-500/20",
    pending: "bg-amber-500/5 text-amber-500 border-amber-500/20",
    draft: "bg-slate-500/5 text-slate-400 border-slate-500/20",
    unpaid: "bg-red-500/5 text-red-500 border-red-500/20",
    overdue: "bg-rose-500/5 text-rose-500 border-rose-500/20",
  };

  const icons = {
    paid: <CheckCircle size={12} />,
    pending: <Clock size={12} />,
    draft: <FileEdit size={12} />,
    unpaid: <AlertCircle size={12} />,
    overdue: <AlertCircle size={12} />,
  };

  return (
    <span className={cn(
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      styles[status]
    )}>
      {icons[status]}
      {status}
    </span>
  );
};

export default function Dashboard({ 
  documents, 
  allDocuments,
  onEdit, 
  onPreview, 
  onDelete, 
  onDuplicate, 
  onConvert,
  onViewAll,
  onFilter,
  activeFilter = 'all'
}: DashboardProps) {
  const stats = [
    { id: 'paid', label: 'Total Revenue', value: formatCurrency(allDocuments.filter(d => d.type === 'invoice' && d.status === 'paid').reduce((acc, d) => acc + d.total, 0)), icon: TrendingUp, color: 'text-emerald-500' },
    { id: 'pending', label: 'Pending Invoices', value: allDocuments.filter(d => d.type === 'invoice' && d.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
    { id: 'quotation', label: 'Active Quotations', value: allDocuments.filter(d => d.type === 'quotation').length, icon: Quote, color: 'text-blue-500' },
    { id: 'all', label: 'Total Clients', value: new Set(allDocuments.map(d => d.client.email)).size, icon: Users, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <button 
            key={stat.id} 
            onClick={() => onFilter?.(stat.id as any)}
            className={cn(
              "glass-card p-4 sm:p-6 flex items-center gap-3 sm:gap-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-w-0",
              activeFilter === stat.id ? "ring-2 ring-white/20 bg-white/[0.08]" : "hover:bg-white/[0.04]"
            )}
          >
            <div className={cn("p-3 sm:p-4 rounded-full bg-white/[0.03] border border-white/[0.05] shrink-0", stat.color)}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{stat.label}</p>
              <p className="text-lg sm:text-2xl font-bold truncate leading-tight">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Documents</h2>
          <button 
            onClick={onViewAll}
            className="text-sm text-blue-500 hover:text-blue-400 font-medium"
          >
            View All
          </button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-white/5">
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No documents found. Create your first invoice or quotation!
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.05]",
                          doc.type === 'invoice' ? "text-blue-400" : "text-purple-400"
                        )}>
                          {doc.type === 'invoice' ? <FileText size={18} /> : <Quote size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{doc.number}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{doc.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm">{doc.client.name}</p>
                      <p className="text-xs text-slate-500">{doc.client.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {doc.issueDate}
                    </td>
                    <td className="px-6 py-4 font-bold text-sm">
                      {formatCurrency(doc.total)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onPreview(doc)}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onEdit(doc)}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <FileEdit size={16} />
                        </button>
                        <button 
                          onClick={() => onDuplicate(doc)}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        {doc.type === 'quotation' && (
                          <button 
                            onClick={() => onConvert(doc)}
                            className="p-2 hover:bg-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                            title="Convert to Invoice"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => onDelete(doc.id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-white/5">
          {documents.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              No documents found.
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      doc.type === 'invoice' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {doc.type === 'invoice' ? <FileText size={16} /> : <Quote size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.number}</p>
                      <p className="text-xs text-slate-500 capitalize">{doc.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-medium text-sm">{doc.client.name}</p>
                    <p className="text-xs text-slate-500">{doc.issueDate}</p>
                  </div>
                  <p className="font-bold text-lg">{formatCurrency(doc.total)}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => onPreview(doc)}
                    className="flex-1 glass-button py-2 flex items-center justify-center gap-2 text-xs"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button 
                    onClick={() => onEdit(doc)}
                    className="flex-1 glass-button py-2 flex items-center justify-center gap-2 text-xs"
                  >
                    <FileEdit size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(doc.id)}
                    className="p-2 glass-button text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
