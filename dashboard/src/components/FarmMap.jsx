import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { ParticleCard } from './MagicBento';

// A large farm in the midwest US (e.g., Iowa)
const FARM_CENTER = [41.9773, -93.6357];

// Generate fake outskirt devices (~60m apart max)
// 1 degree latitude = ~111km. 60m = ~0.00054 degrees
const FARM_NODES = Array.from({ length: 15 }).map((_, i) => {
  const angle = (i / 15) * Math.PI * 2;
  const radius = 0.0002 + Math.random() * 0.0003; // ~20m to 50m spread
  const lat = FARM_CENTER[0] + Math.cos(angle) * radius;
  const lng = FARM_CENTER[1] + Math.sin(angle) * radius;
  
  // Random alert frequency for testing colors
  const alerts = Math.floor(Math.random() * 100); 
  
  return { id: `NODE-${i+1}`, lat, lng, alerts };
});

// Spectrum from Prometheus: Blue (Low) -> Cyan -> Green -> Yellow -> Red (High)
const getAlertColor = (count) => {
  if (count <= 20) return '#000080'; // Deep Blue
  if (count <= 40) return '#00FFFF'; // Cyan
  if (count <= 60) return '#00FF00'; // Green
  if (count <= 80) return '#FFFF00'; // Yellow
  return '#FF0000'; // Red
};

// Helper component for the Heatmap layer
const HeatmapLayer = ({ nodes }) => {
  const map = useMap();
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    
    try {
      if (typeof L.heatLayer !== 'function') {
        console.warn("Leaflet.heat plugin is missing or didn't load correctly.");
        return;
      }
      
      const points = nodes.map(n => [n.lat, n.lng, n.alerts]);
      const heatLayer = L.heatLayer(points, {
        radius: 60,
        blur: 40,
        maxZoom: 18,
        max: 100,
        gradient: {
          0.2: '#000080',
          0.4: '#00FFFF',
          0.6: '#00FF00',
          0.8: '#FFFF00',
          1.0: '#FF0000',
        }
      }).addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    } catch (err) {
      console.error("HeatmapLayer failed:", err);
    }
  }, [map, nodes]);
  return null;
};

const FarmMap = () => {
  return (
    <ParticleCard
      className="magic-bento-card magic-bento-card--border-glow w-full flex-1 min-h-[250px] relative overflow-hidden"
      glowColor="16, 185, 129" particleCount={0} enableMagnetism={false}
      style={{ '--glow-color': '16, 185, 129', display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      {/* Overlay Header */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none drop-shadow-lg">
        <h2 className="font-heading text-2xl uppercase text-neo-cream drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Live Farm Map</h2>
        <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Real-time Node Telemetry</p>
      </div>

      {/* The Leaflet Map */}
      <MapContainer 
        center={FARM_CENTER} 
        zoom={17} // Zoomed in much closer for 60m radius
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Heatmap underneath the nodes */}
        <HeatmapLayer nodes={FARM_NODES} />

        {/* Render nodes as glowing dots */}
        {FARM_NODES.map((node, i) => (
          <CircleMarker
            key={i}
            center={[node.lat, node.lng]}
            radius={8}
            pathOptions={{
              fillColor: getAlertColor(node.alerts),
              fillOpacity: 1,
              color: '#ffffff', // White border
              weight: 2,
            }}
          >
            <Popup className="custom-dark-popup">
              <div className="flex flex-col gap-1 p-1">
                <div className="font-heading text-lg uppercase" style={{ color: getAlertColor(node.alerts) }}>
                  {node.id}
                </div>
                <div className="text-xs font-mono text-white/70">
                  Total Alerts: <strong className="text-white">{node.alerts}</strong>
                </div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1 pt-1 border-t border-white/10">
                  Severity Level
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </ParticleCard>
  );
};

export default FarmMap;
