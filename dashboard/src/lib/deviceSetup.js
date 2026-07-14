import { supabase } from './supabase';

const NODE_NAMES = ['North Node', 'NE Node', 'SE Node', 'SW Node', 'NW Node'];
const NODE_ANGLES = [0, 72, 144, 216, 288]; // evenly spaced at 72° apart

/**
 * Provisions a hub + 5 edge nodes for a brand new user.
 * Also inserts default "offline" telemetry for each node.
 */
export async function provisionDevices(userId) {
  const devicesToInsert = [
    {
      user_id: userId,
      name: 'Raspberry Pi Hub',
      type: 'hub',
      status: 'online',
      position_angle: 0,
    },
    ...NODE_NAMES.map((name, i) => ({
      user_id: userId,
      name,
      type: 'node',
      status: 'offline',
      position_angle: NODE_ANGLES[i],
    })),
  ];

  const { data: devices, error } = await supabase
    .from('devices')
    .insert(devicesToInsert)
    .select();

  if (error) {
    console.error('Error provisioning devices:', error);
    return { error };
  }

  // Insert default telemetry for each node (not the hub)
  const nodes = devices.filter((d) => d.type === 'node');
  const telemetryToInsert = nodes.map((node) => ({
    device_id: node.id,
    ultrasonic_cm: 450,
    pir_triggered: false,
    microwave_triggered: false,
    threat_level: 0,
  }));

  await supabase.from('telemetry').insert(telemetryToInsert);

  return { devices };
}

/**
 * Fetches all devices (and latest telemetry) for a user.
 */
export async function fetchUserDevices(userId) {
  const { data, error } = await supabase
    .from('devices')
    .select(`
      *,
      telemetry (
        ultrasonic_cm,
        pir_triggered,
        microwave_triggered,
        threat_level,
        recorded_at
      )
    `)
    .eq('user_id', userId)
    .order('recorded_at', { referencedTable: 'telemetry', ascending: false });

  return { data, error };
}

/**
 * Builds a threat profile from state + animal selections.
 * Uses curated offline dataset.
 */
const THREAT_DATA = {
  'Wild Boar': { level: 'HIGH', time: 'Night & Dawn', notes: 'Travels in sounders, highly destructive to root crops.' },
  'Nilgai': { level: 'HIGH', time: 'Dawn & Dusk', notes: 'Largest Asian antelope. Damages standing crops in large groups.' },
  'Monkey': { level: 'MEDIUM', time: 'Daytime', notes: 'Raids crops during daytime. Responds to noise deterrents.' },
  'Elephant': { level: 'CRITICAL', time: 'Night', notes: 'Extremely dangerous. Destroys fences and large crop areas.' },
  'Leopard': { level: 'HIGH', time: 'Night', notes: 'Targets livestock. Rare direct crop damage.' },
  'Deer': { level: 'MEDIUM', time: 'Dawn & Dusk', notes: 'Grazes on crops, especially leafy vegetables.' },
  'Jackal': { level: 'LOW', time: 'Night', notes: 'Targets poultry and small animals near the farm.' },
  'Stray Dogs': { level: 'LOW', time: 'Any time', notes: 'Pack behaviour can escalate. Targets livestock.' },
  'Rabbit': { level: 'LOW', time: 'Night', notes: 'Nibbles on root crops and seedlings.' },
  'Crow': { level: 'LOW', time: 'Daytime', notes: 'Damages grain crops at harvest time.' },
  'Porcupine': { level: 'MEDIUM', time: 'Night', notes: 'Destroys root vegetables and tubers overnight.' },
  'Peafowl': { level: 'LOW', time: 'Daytime', notes: 'Damages tender crops, protected by law in India.' },
};

export function buildThreatProfile(animals) {
  const levels = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  let overallLevel = 'LOW';
  let maxScore = 0;
  const threats = [];

  for (const animal of animals) {
    const t = THREAT_DATA[animal];
    if (t) {
      threats.push({ animal, ...t });
      if (levels[t.level] > maxScore) {
        maxScore = levels[t.level];
        overallLevel = t.level;
      }
    }
  }

  return { overallLevel, threats };
}
