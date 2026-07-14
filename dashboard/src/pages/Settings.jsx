import React, { useState, useEffect } from 'react';
import LineSidebar from '../components/LineSidebar';
import { supabase } from '../lib/supabase';
import AvatarPicker from '../components/AvatarPicker';
import { useLanguage } from '../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import FlowingMenu from '../components/FlowingMenu';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const COUNTRY_CODES = [
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+7', label: 'RU (+7)' },
  { code: '+20', label: 'EG (+20)' },
  { code: '+27', label: 'ZA (+27)' },
  { code: '+33', label: 'FR (+33)' },
  { code: '+34', label: 'ES (+34)' },
  { code: '+39', label: 'IT (+39)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+49', label: 'DE (+49)' },
  { code: '+52', label: 'MX (+52)' },
  { code: '+54', label: 'AR (+54)' },
  { code: '+55', label: 'BR (+55)' },
  { code: '+60', label: 'MY (+60)' },
  { code: '+61', label: 'AU (+61)' },
  { code: '+62', label: 'ID (+62)' },
  { code: '+63', label: 'PH (+63)' },
  { code: '+64', label: 'NZ (+64)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+66', label: 'TH (+66)' },
  { code: '+81', label: 'JP (+81)' },
  { code: '+82', label: 'KR (+82)' },
  { code: '+84', label: 'VN (+84)' },
  { code: '+86', label: 'CN (+86)' },
  { code: '+90', label: 'TR (+90)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+92', label: 'PK (+92)' },
  { code: '+93', label: 'AF (+93)' },
  { code: '+94', label: 'LK (+94)' },
  { code: '+95', label: 'MM (+95)' },
  { code: '+98', label: 'IR (+98)' },
  { code: '+234', label: 'NG (+234)' },
  { code: '+254', label: 'KE (+254)' },
  { code: '+351', label: 'PT (+351)' },
  { code: '+353', label: 'IE (+353)' },
  { code: '+358', label: 'FI (+358)' },
  { code: '+380', label: 'UA (+380)' },
  { code: '+966', label: 'SA (+966)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+972', label: 'IL (+972)' }
];

const ProfileTab = ({ profile, setProfile }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(profile?.name || '');
  
  // Parse existing phone number
  const initialPhone = profile?.phone || '';
  
  // Find matching country code or default to +91
  let initialCode = '+91';
  if (initialPhone) {
    const match = COUNTRY_CODES.find(c => initialPhone.startsWith(c.code));
    if (match) initialCode = match.code;
  }
  
  const initialNum = initialPhone ? initialPhone.replace(initialCode, '').trim() : '';

  const [phoneCode, setPhoneCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialNum);
  const [email, setEmail] = useState(profile?.email || '');
  const [avatar, setAvatar] = useState(profile?.avatar_id || 1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    // Validation
    const cleanPhone = phone.replace(/[\s-]/g, ''); // Allow spaces and dashes, but no letters
    const isValidPhone = /^[0-9]{10}$/.test(cleanPhone); // Now requires exactly 10 digits
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (phone && !isValidPhone) {
      setError(t('invalidPhone'));
      return;
    }
    if (email && !isValidEmail) {
      setError(t('invalidEmail'));
      return;
    }
    setError('');

    const fullPhone = phone ? `${phoneCode} ${cleanPhone}` : '';

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').update({ name, phone: fullPhone, email, avatar_id: avatar }).eq('id', user.id);
    setProfile(p => ({ ...p, name, phone: fullPhone, email, avatar_id: avatar }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl animate-fadeIn mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Avatar */}
        <div>
          <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-3">
            {t('guardianAvatar')}
          </label>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
              {t('displayName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neo-surface border border-neo-border rounded-xl px-4 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors"
            />
          </div>

          <div>
            <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
              {t('phoneNumber')}
            </label>
            <div className="flex gap-2">
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="bg-neo-surface border border-neo-border rounded-xl px-3 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors w-28 appearance-none cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23F4E7D5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="flex-1 bg-neo-surface border border-neo-border rounded-xl px-4 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
              {t('emailAddress')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-neo-surface border border-neo-border rounded-xl px-4 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors"
            />
          </div>

          {error && <p className="text-red-400 font-subheading text-xs uppercase tracking-widest">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-4 mt-2 bg-neo-cream text-neo-dark font-subheading font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-colors"
          >
            {saving ? t('saving') : saved ? t('saved') : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

const LanguageTab = () => {
  const { t, lang, setLang } = useLanguage();

  const languageItems = [
    { id: 'en', text: 'CROPCALM · English', textColor: '#F59E0B', marqueeBgColor: '#F59E0B', marqueeTextColor: '#000' },
    { id: 'hi', text: 'CROPCALM · हिंदी', textColor: '#3B82F6', marqueeBgColor: '#3B82F6', marqueeTextColor: '#000' },
    { id: 'ta', text: 'CROPCALM · தமிழ்', textColor: '#10B981', marqueeBgColor: '#10B981', marqueeTextColor: '#000' },
    { id: 'te', text: 'CROPCALM · తెలుగు', textColor: '#EC4899', marqueeBgColor: '#EC4899', marqueeTextColor: '#000' },
    { id: 'mr', text: 'CROPCALM · मराठी', textColor: '#8B5CF6', marqueeBgColor: '#8B5CF6', marqueeTextColor: '#000' },
    { id: 'bn', text: 'CROPCALM · বাংলা', textColor: '#EF4444', marqueeBgColor: '#EF4444', marqueeTextColor: '#000' }
  ];

  return (
    <div className="w-full h-full animate-fadeIn flex flex-col mt-4">
      <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-8">
        {t('currentLanguage')}: {languageItems.find(l => l.id === lang)?.text.split('· ')[1] || 'English'}
      </p>
      
      <div className="flex-1 min-h-[500px] relative rounded-2xl overflow-hidden border-2 border-neo-cream/20">
        <FlowingMenu 
          items={languageItems}
          bgColor="#121212"
          borderColor="rgba(244, 231, 213, 0.1)"
          onItemClick={(id) => setLang(id)}
        />
      </div>
    </div>
  );
};

const ImportDataTab = () => {
  const { t } = useLanguage();
  const handleDownloadCSV = () => {
    const csvContent = 
      "Date,Time,Node ID,Threat Level,Ultrasonic (cm),PIR Motion,Microwave Radar\n" +
      "2026-07-10,02:15:00,NW-01,SECURE,288,CLEAR,CLEAR\n" +
      "2026-07-10,14:22:10,NE-02,MID,180,DETECTED,CLEAR\n" +
      "2026-07-11,04:05:45,SE-03,NEAR,80,DETECTED,DETECTED\n" +
      "2026-07-12,23:10:00,SW-04,FAR,420,CLEAR,DETECTED\n" +
      "2026-07-13,11:30:00,N-05,SECURE,500,CLEAR,CLEAR\n" +
      "2026-07-14,01:12:33,SE-03,NEAR,65,DETECTED,DETECTED\n" +
      "2026-07-14,01:45:00,SE-03,MID,150,DETECTED,CLEAR\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cropcalm_telemetry_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl animate-fadeIn mt-4">
      <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-8">
        Download all telemetry and alert data for the last month in an Excel file.
      </p>
      
      <div 
        onClick={handleDownloadCSV}
        className="border border-neo-border rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-neo-surface hover:bg-neo-surface-2 transition-colors cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="font-heading text-2xl uppercase mb-2">{t('downloadCSV')}</h3>
        <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50">
          {t('includesSensorData')}
        </p>
      </div>
    </div>
  );
};

const monthData = [
  { month: 'Jan', alerts: 30 },
  { month: 'Feb', alerts: 50 },
  { month: 'Mar', alerts: 40 },
  { month: 'Apr', alerts: 80 },
  { month: 'May', alerts: 100 },
  { month: 'Jun', alerts: 60 },
  { month: 'Jul', alerts: 40 },
  { month: 'Aug', alerts: 20 },
  { month: 'Sep', alerts: 10 },
  { month: 'Oct', alerts: 45 },
  { month: 'Nov', alerts: 75 },
  { month: 'Dec', alerts: 90 },
];

const StatisticsTab = () => (
  <div className="max-w-3xl animate-fadeIn mt-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="p-6 bg-gradient-to-br from-neo-surface-2 to-neo-surface border border-neo-border rounded-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
        <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 mb-2 relative z-10">Total Alerts (2025)</p>
        <p className="font-heading text-5xl uppercase text-red-400 relative z-10">1,204</p>
      </div>
      <div className="p-6 bg-gradient-to-br from-neo-surface-2 to-neo-surface border border-neo-border rounded-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
        <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 mb-2 relative z-10">Most Common Threat</p>
        <p className="font-heading text-3xl uppercase text-orange-400 mt-3 relative z-10">Wild Boar</p>
      </div>
      <div className="p-6 bg-gradient-to-br from-neo-surface-2 to-neo-surface border border-neo-border rounded-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
        <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 mb-2 relative z-10">Network Uptime</p>
        <p className="font-heading text-5xl uppercase text-green-400 relative z-10">99.8%</p>
      </div>
    </div>
    
    <div className="h-64 bg-gradient-to-br from-neo-surface-2 to-neo-surface border border-neo-border rounded-xl p-6 flex flex-col justify-end">
      <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/40 mb-2">Detection Frequency by Month</p>
      <div className="flex-1 w-full min-h-0 relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-neo-cream)', opacity: 0.4, fontSize: 10, fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-neo-cream)', opacity: 0.4, fontSize: 10, fontFamily: 'Syne, sans-serif' }} 
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-neo-surface)', border: '1px solid var(--color-neo-border)', borderRadius: '8px' }}
              itemStyle={{ color: '#10b981', fontFamily: "'Alfa Slab One', cursive" }}
              labelStyle={{ color: 'var(--color-neo-cream)', fontFamily: 'Syne, sans-serif', opacity: 0.5 }}
            />
            <Line 
              type="monotone" 
              dataKey="alerts" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const ContactTab = () => (
  <div className="max-w-xl animate-fadeIn mt-4">
    <div className="space-y-4">
      <div className="p-6 bg-neo-surface border border-neo-border rounded-xl flex items-center justify-between group hover:border-neo-cream/40 transition-colors">
        <div>
          <h3 className="font-heading text-xl uppercase">24/7 Helpline</h3>
          <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mt-1">+91 8588819662</p>
        </div>
        <a href="tel:+918588819662" className="px-4 py-2 border border-neo-cream text-neo-cream rounded-full font-subheading text-xs uppercase tracking-widest hover:bg-neo-cream hover:text-neo-dark transition-colors">Call Now</a>
      </div>
      
      <div className="p-6 bg-neo-surface border border-neo-border rounded-xl flex items-center justify-between group hover:border-neo-cream/40 transition-colors">
        <div>
          <h3 className="font-heading text-xl uppercase">Instagram</h3>
          <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mt-1">@tired_kurkure</p>
        </div>
        <a href="https://instagram.com/tired_kurkure" target="_blank" rel="noreferrer" className="px-4 py-2 border border-neo-cream text-neo-cream rounded-full font-subheading text-xs uppercase tracking-widest hover:bg-neo-cream hover:text-neo-dark transition-colors">Follow</a>
      </div>

      <div className="p-6 bg-neo-surface border border-neo-border rounded-xl flex items-center justify-between group hover:border-neo-cream/40 transition-colors">
        <div>
          <h3 className="font-heading text-xl uppercase">Email Support</h3>
          <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mt-1">krishnaxaradhy@gmail.com</p>
        </div>
        <a href="mailto:krishnaxaradhy@gmail.com" className="px-4 py-2 border border-neo-cream text-neo-cream rounded-full font-subheading text-xs uppercase tracking-widest hover:bg-neo-cream hover:text-neo-dark transition-colors">Send Email</a>
      </div>
    </div>
  </div>
);

const AboutTab = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-xl animate-fadeIn mt-4">
      <p className="font-body text-neo-cream/70 leading-relaxed mb-8">
        CropCalm is a next-generation acoustic and radar-based perimeter defense network. By combining hardware sensor meshes with advanced analytics, it provides an early warning system against human-wildlife conflict and agricultural intrusion.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-neo-surface border border-neo-border-faint rounded-xl">
          <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('version')}</p>
          <p className="font-heading text-xl uppercase">v2.1.0-beta</p>
        </div>
        <div className="p-4 bg-neo-surface border border-neo-border-faint rounded-xl">
          <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('systemArchitecture')}</p>
          <p className="font-heading text-xl uppercase">Mesh / Edge</p>
        </div>
      </div>
    </div>
  );
};

export default function Settings() {
  const { profile, setProfile } = useOutletContext() || { profile: null, setProfile: () => {} };
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const TABS = [t('profile'), t('language'), t('importData'), t('statistics'), t('contactUs'), t('about')];

  return (
    <div className="flex-1 flex p-8" style={{ minHeight: 0 }}>
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0 pt-4">
        <h1 className="font-heading text-3xl uppercase tracking-widest mb-12 text-neo-cream pl-6">{TABS[activeIndex]}</h1>
        <LineSidebar
          items={TABS}
          accentColor="#F4E7D5"
          textColor="rgba(244, 231, 213, 0.4)"
          markerColor="rgba(244, 231, 213, 0.2)"
          showIndex={true}
          showMarker={true}
          defaultActive={activeIndex}
          onItemClick={(idx) => setActiveIndex(idx)}
          className="pr-4"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pl-16 pt-4 pb-12">
        {activeIndex === 0 && <ProfileTab key={profile?.id || 'loading'} profile={profile} setProfile={setProfile} />}
        {activeIndex === 1 && <LanguageTab />}
        {activeIndex === 2 && <ImportDataTab />}
        {activeIndex === 3 && <StatisticsTab />}
        {activeIndex === 4 && <ContactTab />}
        {activeIndex === 5 && <AboutTab />}
      </div>
    </div>
  );
}
