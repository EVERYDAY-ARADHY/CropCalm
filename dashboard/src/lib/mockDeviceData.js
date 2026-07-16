// Based on typical Indian farm threats
const ANIMALS = [
  { name: 'Wild Boar', threat_level: 2, size: 'medium', speed: 'fast', description: 'Low ground signature, fast moving.' },
  { name: 'Nilgai (Blue Bull)', threat_level: 2, size: 'large', speed: 'moderate', description: 'Large profile, moderate speed.' },
  { name: 'Wild Elephant', threat_level: 3, size: 'massive', speed: 'slow', description: 'Massive heat signature, extreme crop damage risk.' },
  { name: 'Stray Cattle', threat_level: 1, size: 'large', speed: 'slow', description: 'Large grazing profile, slow movement.' },
  { name: 'Monkey Troop', threat_level: 2, size: 'small', speed: 'fast', description: 'Multiple small, fast moving heat signatures.' },
];

export const generateMockDevices = (count = 15) => {
  const devices = [];
  devices.push({ id: 'demo-hub', user_id: 'demo', name: 'Raspberry Pi Hub', type: 'hub', status: 'online', position_angle: 0, telemetry: [] });

  const directions = ['North', 'N-East', 'East', 'S-East', 'South', 'S-West', 'West', 'N-West'];

  for (let i = 0; i < count; i++) {
    const angle = Math.round((i / count) * 360);
    const dirIndex = Math.round(angle / 45) % 8;
    // e.g. North Node 1, North Node 2
    const name = `${directions[dirIndex]} Node ${i + 1}`;
    
    // Determine if this node has an alert
    const isAlert = Math.random() > 0.75; // 25% chance of alert
    let telemetry = [];
    let status = 'online';
    let alerts = [];

    if (isAlert) {
      status = 'alert';
      const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
      let distance = 0;
      let pir = true;
      let mw = true;
      let threat_level = animal.threat_level;

      if (animal.size === 'massive') {
        distance = 300 + Math.random() * 200; // 3-5 meters
        threat_level = 3; // Critical
        alerts.push({ sensor: 'Ultrasonic', detail: 'Massive object detected at perimeter', time: new Date().toLocaleTimeString() });
      } else if (animal.speed === 'fast') {
        distance = 100 + Math.random() * 200;
        mw = true; // Radar picks up fast movement
        alerts.push({ sensor: 'Microwave Radar', detail: 'Fast moving object detected', time: new Date().toLocaleTimeString() });
      } else {
        distance = 150 + Math.random() * 150;
      }

      alerts.push({ sensor: 'AI Assessment', detail: `Suspected signature: ${animal.name}`, time: new Date().toLocaleTimeString() });

      telemetry = [{
        ultrasonic_cm: Math.round(distance),
        pir_triggered: pir,
        microwave_triggered: mw,
        threat_level: threat_level,
        suspected_animal: animal.name,
        animal_desc: animal.description,
        recorded_at: new Date().toISOString()
      }];
    } else {
      telemetry = [{
        ultrasonic_cm: 450 + Math.random() * 100, // nothing close
        pir_triggered: false,
        microwave_triggered: false,
        threat_level: 0,
        suspected_animal: null,
        animal_desc: null,
        recorded_at: new Date().toISOString()
      }];
    }

    devices.push({
      id: `demo-n${i+1}`,
      user_id: 'demo',
      name: name,
      type: 'node',
      status: status,
      position_angle: angle,
      telemetry: telemetry,
      alerts: alerts.length > 0 ? alerts : undefined
    });
  }
  
  // Ensure at least one CRITICAL (level 3) alert for the dashboard Ongoing Alert to look good
  const hasCritical = devices.some(d => d.type === 'node' && d.telemetry[0]?.threat_level === 3);
  if (!hasCritical && devices.length > 1) {
    const node = devices[2]; // Pick the second node to be critical
    node.status = 'alert';
    node.telemetry = [{
      ultrasonic_cm: 220,
      pir_triggered: true,
      microwave_triggered: true,
      threat_level: 3,
      suspected_animal: 'Wild Elephant',
      animal_desc: 'Massive heat signature, extreme crop damage risk.',
      recorded_at: new Date().toISOString()
    }];
    node.alerts = [
      { sensor: 'PIR & Radar', detail: 'Massive, slow moving object detected', time: new Date().toLocaleTimeString() },
      { sensor: 'AI Assessment', detail: `Suspected signature: Wild Elephant`, time: new Date().toLocaleTimeString() }
    ];
  }

  return devices;
};
