import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import FarmScene from '../components/FarmScene';
import NodePanel from '../components/NodePanel';
import { DefaultRightPanel } from '../components/MagicBento';
import { useLanguage } from '../context/LanguageContext';

export const DEMO_DEVICES = [
  { id: 'demo-hub', user_id: 'demo', name: 'Raspberry Pi Hub', type: 'hub',  status: 'online', position_angle: 0,   telemetry: [] },
  { id: 'demo-n1',  user_id: 'demo', name: 'North',       type: 'node', status: 'online', position_angle: 0,   telemetry: [{ ultrasonic_cm: 450, pir_triggered: false, microwave_triggered: false, threat_level: 0, recorded_at: new Date().toISOString() }] },
  { id: 'demo-n2',  user_id: 'demo', name: 'North East',  type: 'node', status: 'alert',  position_angle: 72,  telemetry: [{ ultrasonic_cm: 180, pir_triggered: true,  microwave_triggered: false, threat_level: 2, recorded_at: new Date().toISOString() }] },
  {
    id: 'demo-n3', user_id: 'demo', name: 'South East', type: 'node', status: 'alert', position_angle: 144,
    alerts: [
      { sensor: 'PIR Motion',      detail: 'Motion detected at perimeter', time: '22:58:34' },
      { sensor: 'Microwave Radar', detail: 'Large moving object confirmed', time: '22:58:36' },
    ],
    telemetry: [{ ultrasonic_cm: 60, pir_triggered: true, microwave_triggered: true, threat_level: 3, recorded_at: new Date().toISOString() }],
  },
  { id: 'demo-n4',  user_id: 'demo', name: 'South West',  type: 'node', status: 'alert',  position_angle: 216, telemetry: [{ ultrasonic_cm: 200, pir_triggered: true,  microwave_triggered: false, threat_level: 2, recorded_at: new Date().toISOString() }] },
  { id: 'demo-n5',  user_id: 'demo', name: 'North West',  type: 'node', status: 'online', position_angle: 288, telemetry: [{ ultrasonic_cm: 390, pir_triggered: false, microwave_triggered: false, threat_level: 0, recorded_at: new Date().toISOString() }] },
];

export default function Dashboard() {
  const { t } = useLanguage();
  const [devices, setDevices]           = useState(DEMO_DEVICES);
  const [profile, setProfile]           = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [displayedNode, setDisplayedNode] = useState(null);
  const [nodeVisible, setNodeVisible]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);
      }
      setDevices(DEMO_DEVICES);
      setLoading(false);
    }
    load();
  }, []);

  const handleNodeClick = (node) => {
    clearTimeout(timer.current);
    const isSame = node?.id === selectedNode?.id;
    const next = isSame ? null : node;

    if (nodeVisible && next) {
      // Switch: fade out → swap → fade in
      setNodeVisible(false);
      timer.current = setTimeout(() => {
        setDisplayedNode(next);
        setSelectedNode(next);
        timer.current = setTimeout(() => setNodeVisible(true), 20);
      }, 260);
    } else if (next) {
      setDisplayedNode(next);
      setSelectedNode(next);
      timer.current = setTimeout(() => setNodeVisible(true), 20);
    } else {
      setNodeVisible(false);
      timer.current = setTimeout(() => { setDisplayedNode(null); setSelectedNode(null); }, 280);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="font-heading text-2xl uppercase animate-pulse">{t('fetchingEdgeNodes')}</p>
    </div>
  );

  const expanded = !!selectedNode;
  const nodes = devices.filter(d => d.type === 'node');
  const onlineCount = nodes.filter(d => d.status !== 'offline').length;

  return (
    <div className="flex-1 flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>

      {/* ── Body: radar + right panel side by side ────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Radar ──────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex items-center justify-center p-3 transition-all duration-500"
          style={{ width: expanded ? '54%' : '50%', minHeight: 0 }}
        >
          <div style={{ width: '100%', height: '100%', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ aspectRatio: '1/1', maxWidth: '100%', maxHeight: '100%', width: '100%' }}>
              <FarmScene devices={devices} onNodeClick={handleNodeClick} selectedNode={selectedNode} />
            </div>
          </div>
        </div>

        {/* ── DIVIDER ───────────────────────────────────────────────── */}
        <div className="w-px bg-neo-border-faint flex-shrink-0 self-stretch" />

        {/* ── RIGHT: layered panels in a grid ──────────────────────── */}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden" style={{ display: 'grid', gridTemplateRows: '1fr' }}>

          {/* Overview panel */}
          <div style={{
            gridArea: '1 / 1',
            overflow: 'hidden',
            opacity: expanded ? 0 : 1,
            pointerEvents: expanded ? 'none' : 'auto',
            transition: 'opacity 0.28s ease',
          }}>
            <DefaultRightPanel devices={devices} profile={profile} />
          </div>

          {/* Node detail panel */}
          <div style={{
            gridArea: '1 / 1',
            overflow: 'hidden',
            opacity: nodeVisible ? 1 : 0,
            pointerEvents: nodeVisible ? 'auto' : 'none',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
            transform: nodeVisible ? 'translateY(0)' : 'translateY(12px)',
          }}>
            {displayedNode && (
              <NodePanel node={displayedNode} onClose={() => handleNodeClick(null)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
