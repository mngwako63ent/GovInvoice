import React, { useState } from 'react';
import { Save, Building2, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { CompanyDetails } from '../types';

interface SettingsProps {
  company: CompanyDetails;
  onSave: (company: CompanyDetails) => void;
}

export default function Settings({ company, onSave }: SettingsProps) {
  const [formData, setFormData] = useState<CompanyDetails>(company);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
        {isSaved && (
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm animate-in fade-in slide-in-from-right-4">
            <CheckCircle size={18} />
            <span>Changes saved successfully</span>
          </div>
        )}
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Company Profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full glass-input pl-14"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full glass-input pl-14"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full glass-input pl-14"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-6 top-6 text-slate-500" size={16} />
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full glass-input pl-14 min-h-[100px] rounded-[1.5rem] py-4"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button type="submit" className="glass-button-primary flex items-center gap-2 px-8">
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
