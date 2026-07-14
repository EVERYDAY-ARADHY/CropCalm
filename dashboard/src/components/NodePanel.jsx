import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const THREAT_LABELS = ['ALL CLEAR', 'MOTION', 'ALERT', 'CRITICAL'];
const THREAT_COLORS = ['#157A26', '#f59e0b', '#f97316', '#ef4444'];

export default function NodePanel({ node, onClose }) {
  const { t } = useLanguage();
  if (!node) return null;

  const telemetry = node.telemetry?.[0];
  const threat = telemetry?.threat_level ?? 0;
  const color = THREAT_COLORS[threat];

  const statusColor = node.status === 'alert' ? color : (node.status === 'online' ? '#157A26' : '#6b7280');

  return (
    <div className="flex flex-col m-4 rounded-[20px] border-2 border-neo-border shadow-[8px_8px_0px_rgba(var(--color-neo-cream-rgb),0.1)] bg-neo-surface" style={{ maxHeight: 'calc(100% - 32px)' }}>

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-neo-border">
        <div>
          <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">Edge Node</p>
          <h3 className="font-heading text-3xl uppercase text-neo-cream">{node.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="mt-1 w-8 h-8 flex items-center justify-center border-2 border-neo-border rounded-lg hover:border-neo-cream transition-colors text-neo-cream/50 hover:text-neo-cream"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="overflow-y-auto px-6 py-4 flex flex-col gap-4">

        {/* Status + Threat side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-neo-border rounded-xl p-4">
            <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
              <p className="font-subheading font-bold text-sm uppercase tracking-widest" style={{ color: statusColor }}>{node.status}</p>
            </div>
          </div>
          <div className="border-2 border-neo-border rounded-xl p-4">
            <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-1">{t('position')}</p>
            <p className="font-subheading font-bold text-sm uppercase">{node.position_angle}°</p>
          </div>
        </div>

        {/* Threat Level — prominent */}
        <div className="border-2 rounded-xl p-5" style={{ borderColor: `${color}44`, backgroundColor: `${color}0d` }}>
          <p className="font-subheading text-[10px] uppercase tracking-widest mb-1" style={{ color: `${color}99` }}>{t('threatLevel')}</p>
          <p className="font-heading text-5xl uppercase" style={{ color, textShadow: `0 0 30px ${color}66` }}>
            {THREAT_LABELS[threat]}
          </p>
        </div>

        {/* Active Alerts log */}
        {node.alerts && node.alerts.length > 0 && (
          <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: `${color}33` }}>
            <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: `${color}18` }}>
              <p className="font-subheading text-[10px] uppercase tracking-widest" style={{ color }}>
                Active Alerts
              </p>
              <span className="font-heading text-lg" style={{ color }}>
                {node.alerts.length}
              </span>
            </div>
            <div className="divide-y divide-neo-cream/8">
              {node.alerts.map((alert, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-subheading font-bold text-xs uppercase tracking-widest" style={{ color }}>{alert.sensor}</p>
                    <p className="font-subheading text-[10px] text-neo-cream/50 mt-0.5">{alert.detail}</p>
                  </div>
                  <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/30 flex-shrink-0 mt-0.5">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sensor Readings */}
        {telemetry ? (
          <>
            {/* Ultrasonic */}
            <div className="border-2 border-neo-border rounded-xl p-4">
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-2">{t('ultrasonic')}</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-4xl text-neo-cream">{telemetry.ultrasonic_cm} <span className="text-xl text-neo-cream/50">cm</span></p>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold font-subheading uppercase tracking-widest ${telemetry.ultrasonic_cm < 150 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {telemetry.ultrasonic_cm < 150 ? 'NEAR' : 'CLEAR'}
                </div>
              </div>
              {/* Visual bar */}
              <div className="mt-3 h-1.5 bg-neo-cream/10 rounded-full">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.max(5, 100 - (telemetry.ultrasonic_cm / 5))}%`,
                    backgroundColor: telemetry.ultrasonic_cm < 150 ? '#ef4444' : '#157A26',
                    boxShadow: `0 0 8px ${telemetry.ultrasonic_cm < 150 ? '#ef4444' : '#157A26'}`,
                  }}
                />
              </div>
            </div>

            {/* PIR + Microwave */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-neo-border rounded-xl p-4">
                <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-2">PIR Motion</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${telemetry.pir_triggered ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ boxShadow: `0 0 8px ${telemetry.pir_triggered ? '#ef4444' : '#157A26'}` }} />
                  <p className={`font-subheading font-bold text-sm uppercase ${telemetry.pir_triggered ? 'text-red-400' : 'text-green-400'}`}>
                    {telemetry.pir_triggered ? 'TRIGGERED' : 'CLEAR'}
                  </p>
                </div>
              </div>
              <div className="border-2 border-neo-border rounded-xl p-4">
                <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 mb-2">Microwave</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${telemetry.microwave_triggered ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ boxShadow: `0 0 8px ${telemetry.microwave_triggered ? '#ef4444' : '#157A26'}` }} />
                  <p className={`font-subheading font-bold text-sm uppercase ${telemetry.microwave_triggered ? 'text-red-400' : 'text-green-400'}`}>
                    {telemetry.microwave_triggered ? 'ACTIVE' : 'CLEAR'}
                  </p>
                </div>
              </div>
            </div>

            <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/20 text-right">
              Last sync: {telemetry.recorded_at ? new Date(telemetry.recorded_at).toLocaleTimeString() : 'N/A'}
            </p>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-8 border-2 border-neo-border rounded-xl">
            <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/30">No Telemetry Data</p>
            <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/20 mt-1">Node may be offline</p>
          </div>
        )}

        {/* Node ID */}
        <div className="border-t border-neo-border pt-4">
          <p className="font-subheading text-[9px] uppercase tracking-widest text-neo-cream/20">
            Node ID: {node.id}
          </p>
        </div>
      </div>
    </div>
  );
}
