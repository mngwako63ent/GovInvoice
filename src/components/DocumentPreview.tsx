import React, { useRef } from 'react';
import { 
  Download, 
  FileEdit, 
  ArrowLeft, 
  Printer, 
  Share2,
  FileText,
  Quote,
  ArrowRightLeft,
  Image as ImageIcon
} from 'lucide-react';
import { InvoiceDocument } from '../types';
import { cn, formatCurrency } from '../utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentPreviewProps {
  doc: InvoiceDocument;
  onEdit: () => void;
  onBack: () => void;
  onConvert: (doc: InvoiceDocument) => void;
}

export default function DocumentPreview({ doc, onEdit, onBack, onConvert }: DocumentPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState<'pdf' | 'png' | null>(null);
  const [isPrintMode, setIsPrintMode] = React.useState(false);
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 3000);
  };

  const exportPDF = async () => {
    if (!printRef.current) return;
    
    // Force print mode for export
    const wasPrintMode = isPrintMode;
    if (!wasPrintMode) setIsPrintMode(true);
    
    // Small delay to allow re-render if mode changed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsExporting('pdf');
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 3, // Higher scale for better resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('invoice-preview');
          if (el) {
            el.style.height = 'auto';
            el.style.minHeight = '0';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add extra pages if the content is longer than one A4 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`${doc.number}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(null);
      if (!wasPrintMode) setIsPrintMode(false);
    }
  };

  const exportPNG = async () => {
    if (!printRef.current) return;
    
    const wasPrintMode = isPrintMode;
    if (!wasPrintMode) setIsPrintMode(true);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsExporting('png');
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 4, // Very high resolution for PNG
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('invoice-preview');
          if (el) {
            el.style.height = 'auto';
            el.style.minHeight = '0';
          }
        }
      });
      const link = document.createElement('a');
      link.download = `${doc.number}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('PNG Export failed:', error);
    } finally {
      setIsExporting(null);
      if (!wasPrintMode) setIsPrintMode(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={onBack} className="glass-button flex items-center gap-2 px-4">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          {/* Mode Toggle */}
          <div className="flex p-1 bg-white/[0.03] rounded-full border border-white/[0.08]">
            <button 
              onClick={() => setIsPrintMode(false)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                !isPrintMode ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
              )}
            >
              Preview
            </button>
            <button 
              onClick={() => setIsPrintMode(true)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                isPrintMode ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
              )}
            >
              Download Mode
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={exportPNG} 
            disabled={isExporting !== null}
            className="flex-1 sm:flex-none glass-button flex items-center justify-center gap-2 px-4 disabled:opacity-50"
          >
            {isExporting === 'png' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ImageIcon size={18} />
            )}
            <span>PNG</span>
          </button>
          <button 
            onClick={exportPDF} 
            disabled={isExporting !== null}
            className="flex-1 sm:flex-none glass-button flex items-center justify-center gap-2 px-4 disabled:opacity-50"
          >
            {isExporting === 'pdf' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
            <span>PDF</span>
          </button>
          <button onClick={onEdit} className="flex-1 sm:flex-none glass-button flex items-center justify-center gap-2 px-4">
            <FileEdit size={18} />
            <span>Edit</span>
          </button>
          {doc.type === 'quotation' && (
            <button 
              onClick={() => onConvert(doc)} 
              className="flex-1 sm:flex-none glass-button-primary flex items-center justify-center gap-2 px-4"
            >
              <ArrowRightLeft size={18} />
              <span>Convert to Invoice</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Document Preview Container */}
        <div className="lg:col-span-3 overflow-x-auto pb-4">
          <div className="min-w-[800px] lg:min-w-0">
              <div 
                id="invoice-preview"
                ref={printRef}
                className={cn(
                  "transition-all duration-500 w-full flex flex-col",
                  isPrintMode 
                    ? "bg-white text-slate-900 p-12" 
                    : "bg-white/[0.02] text-white border border-white/[0.08] p-8 md:p-16 rounded-[3rem] shadow-2xl min-h-[1123px] backdrop-blur-3xl"
                )}
              >
            {/* Header */}
            <div className="flex justify-between items-start mb-20">
              <div>
                <div className={cn(
                  "w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl",
                  isPrintMode ? "bg-blue-600 text-white" : "bg-white/[0.03] text-white border border-white/[0.08] backdrop-blur-xl"
                )}>
                  <FileText size={48} />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{doc.type}</h1>
                <p className={cn(
                  "text-lg font-bold",
                  isPrintMode ? "text-slate-400" : "text-slate-500"
                )}>#{doc.number}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black mb-2">{doc.company.name}</h2>
                <div className={cn(
                  "text-sm space-y-1",
                  isPrintMode ? "text-slate-500" : "text-slate-400"
                )}>
                  <p className="whitespace-pre-line">{doc.company.address}</p>
                  <p>{doc.company.email}</p>
                  <p>{doc.company.phone}</p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-20">
              <div>
                <p className={cn(
                  "text-[11px] font-black uppercase tracking-[0.2em] mb-4",
                  isPrintMode ? "text-blue-600" : "text-blue-400"
                )}>Bill To</p>
                <h3 className="text-xl font-bold mb-2">{doc.client.name}</h3>
                <div className={cn(
                  "text-sm space-y-1",
                  isPrintMode ? "text-slate-500" : "text-slate-400"
                )}>
                  <p className="whitespace-pre-line">{doc.client.address}</p>
                  <p>{doc.client.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div>
                  <p className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] mb-1",
                    isPrintMode ? "text-slate-400" : "text-slate-500"
                  )}>Issue Date</p>
                  <p className="text-base font-bold">{doc.issueDate}</p>
                </div>
                <div>
                  <p className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] mb-1",
                    isPrintMode ? "text-slate-400" : "text-slate-500"
                  )}>Due Date</p>
                  <p className="text-base font-bold">{doc.dueDate}</p>
                </div>
                <div className="col-span-2">
                  <p className={cn(
                    "text-[11px] font-black uppercase tracking-[0.2em] mb-1",
                    isPrintMode ? "text-slate-400" : "text-slate-500"
                  )}>Status</p>
                  <p className={cn(
                    "text-lg font-black uppercase",
                    isPrintMode ? "text-blue-600" : "text-blue-400"
                  )}>{doc.status}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="flex-1">
              <table className="w-full mb-12">
                <thead>
                  <tr className={cn(
                    "border-b-2",
                    isPrintMode ? "border-slate-100" : "border-white/5"
                  )}>
                    <th className={cn(
                      "py-5 text-left text-[11px] font-black uppercase tracking-[0.2em]",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Description</th>
                    <th className={cn(
                      "py-5 text-center text-[11px] font-black uppercase tracking-[0.2em] w-24",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Qty</th>
                    <th className={cn(
                      "py-5 text-right text-[11px] font-black uppercase tracking-[0.2em] w-32",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Price</th>
                    <th className={cn(
                      "py-5 text-right text-[11px] font-black uppercase tracking-[0.2em] w-32",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Total</th>
                  </tr>
                </thead>
                <tbody className={cn(
                  "divide-y",
                  isPrintMode ? "divide-slate-50" : "divide-white/5"
                )}>
                  {doc.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-8 text-base font-bold">{item.description}</td>
                      <td className="py-8 text-base text-center">{item.quantity}</td>
                      <td className="py-8 text-base text-right">{formatCurrency(item.price)}</td>
                      <td className="py-8 text-base font-black text-right">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-20">
              <div className="w-80 space-y-4">
                <div className="flex justify-between text-base">
                  <span className={isPrintMode ? "text-slate-500" : "text-slate-400"}>Subtotal</span>
                  <span className="font-bold">{formatCurrency(doc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className={isPrintMode ? "text-slate-500" : "text-slate-400"}>Tax ({doc.taxRate}%)</span>
                  <span className="font-bold">{formatCurrency(doc.taxAmount)}</span>
                </div>
                <div className={cn(
                  "flex justify-between items-end pt-6 border-t-4",
                  isPrintMode ? "border-blue-600" : "border-blue-500"
                )}>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Total Amount</span>
                  <span className={cn(
                    "text-4xl font-black",
                    isPrintMode ? "text-blue-600" : "text-blue-400"
                  )}>{formatCurrency(doc.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {doc.notes && (
              <div className={cn(
                "pt-12 border-t",
                isPrintMode ? "border-slate-100" : "border-white/5"
              )}>
                <p className={cn(
                  "text-[11px] font-black uppercase tracking-[0.2em] mb-3",
                  isPrintMode ? "text-blue-600" : "text-blue-400"
                )}>Notes & Terms</p>
                <p className={cn(
                  "text-sm leading-relaxed",
                  isPrintMode ? "text-slate-500" : "text-slate-400"
                )}>{doc.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-20 pt-10 text-center">
              <p className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isPrintMode ? "text-slate-300" : "text-slate-600"
              )}>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold">Quick Actions</h3>
            <button 
              onClick={exportPDF} 
              className="w-full glass-button flex items-center justify-center gap-2"
              disabled={isExporting !== null}
            >
              <Printer size={18} />
              <span>{isExporting === 'pdf' ? 'Generating...' : 'Print / Save PDF'}</span>
            </button>
            <div className="relative">
              <button 
                onClick={handleShare}
                className="w-full glass-button flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                <span>Share Link</span>
              </button>
              {showCopySuccess && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                  Link Copied!
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold">Document History</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1 h-full bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs font-bold">Created</p>
                  <p className="text-[10px] text-slate-500">{doc.issueDate}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 h-full bg-slate-700 rounded-full"></div>
                <div>
                  <p className="text-xs font-bold">Status: {doc.status}</p>
                  <p className="text-[10px] text-slate-500">Updated recently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
