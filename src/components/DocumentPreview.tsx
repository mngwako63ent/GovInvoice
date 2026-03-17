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
    
    setIsExporting('pdf');
    const wasPrintMode = isPrintMode;
    setIsPrintMode(true);
    
    // Allow time for state update and layout shift
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: 794,
        windowHeight: 1123
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
      
      // Force fit to A4 page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${doc.number}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(null);
      setIsPrintMode(wasPrintMode);
    }
  };

  const exportPNG = async () => {
    if (!printRef.current) return;
    
    setIsExporting('png');
    const wasPrintMode = isPrintMode;
    setIsPrintMode(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: 794,
        windowHeight: 1123
      });
      
      const link = document.createElement('a');
      link.download = `${doc.number}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('PNG Export failed:', error);
    } finally {
      setIsExporting(null);
      setIsPrintMode(wasPrintMode);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Print Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-preview, #invoice-preview * { visibility: visible; }
          #invoice-preview {
            position: fixed;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

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
          <div className="flex justify-center">
              <div 
                id="invoice-preview"
                ref={printRef}
                className={cn(
                  "transition-all duration-300 flex flex-col shrink-0",
                  isPrintMode 
                    ? "bg-white text-slate-900 p-10 w-[794px] h-[1123px] shadow-none rounded-none overflow-hidden" 
                    : "bg-white/[0.02] text-white border border-white/[0.08] p-8 md:p-16 rounded-[3rem] shadow-2xl min-h-[1123px] backdrop-blur-3xl w-full"
                )}
              >
            {/* Header */}
            <div className="flex justify-between items-start mb-16">
              <div className="flex-1">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl",
                  isPrintMode ? "bg-blue-600 text-white" : "bg-white/[0.03] text-white border border-white/[0.08] backdrop-blur-xl"
                )}>
                  <FileText size={40} />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">{doc.type}</h1>
                <p className={cn(
                  "text-lg font-bold",
                  isPrintMode ? "text-slate-400" : "text-slate-500"
                )}>#{doc.number}</p>
              </div>
              <div className="text-right flex-1">
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
            <div className="grid grid-cols-2 gap-12 mb-16">
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
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
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
              <table className="w-full mb-12 border-collapse">
                <thead>
                  <tr className={cn(
                    "border-b-2",
                    isPrintMode ? "border-slate-100" : "border-white/5"
                  )}>
                    <th className={cn(
                      "py-4 text-left text-[10px] font-black uppercase tracking-[0.2em]",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Description</th>
                    <th className={cn(
                      "py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] w-20",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Qty</th>
                    <th className={cn(
                      "py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] w-32",
                      isPrintMode ? "text-slate-400" : "text-slate-500"
                    )}>Price</th>
                    <th className={cn(
                      "py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] w-32",
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
                      <td className="py-6 text-sm font-bold">{item.description}</td>
                      <td className="py-6 text-sm text-center">{item.quantity}</td>
                      <td className="py-6 text-sm text-right">{formatCurrency(item.price)}</td>
                      <td className="py-6 text-sm font-black text-right">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-16">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={isPrintMode ? "text-slate-500" : "text-slate-400"}>Subtotal</span>
                  <span className="font-bold">{formatCurrency(doc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isPrintMode ? "text-slate-500" : "text-slate-400"}>Tax ({doc.taxRate}%)</span>
                  <span className="font-bold">{formatCurrency(doc.taxAmount)}</span>
                </div>
                <div className={cn(
                  "flex justify-between items-center pt-4 border-t-2 mt-2",
                  isPrintMode ? "border-blue-600" : "border-blue-500"
                )}>
                  <span className="text-xs font-black uppercase tracking-[0.1em]">Total Amount</span>
                  <span className={cn(
                    "text-2xl font-black",
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
