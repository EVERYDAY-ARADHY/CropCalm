// Dummy market data representing crop production in India (approximate latest values)
// Production quantities generally in Million Tonnes, except Cotton which is in Million Bales

export const marketData = [
  {
    crop: 'Rice',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Uttar Pradesh', production: 15.6 },
      { rank: 2, state: 'Telangana', production: 14.8 },
      { rank: 3, state: 'West Bengal', production: 14.5 },
      { rank: 4, state: 'Punjab', production: 12.2 },
      { rank: 5, state: 'Odisha', production: 8.9 }
    ]
  },
  {
    crop: 'Wheat',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Uttar Pradesh', production: 35.4 },
      { rank: 2, state: 'Madhya Pradesh', production: 22.8 },
      { rank: 3, state: 'Punjab', production: 17.1 },
      { rank: 4, state: 'Haryana', production: 11.2 },
      { rank: 5, state: 'Rajasthan', production: 9.8 }
    ]
  },
  {
    crop: 'Cotton',
    unit: 'Million Bales (170kg)',
    rankings: [
      { rank: 1, state: 'Maharashtra', production: 8.5 },
      { rank: 2, state: 'Gujarat', production: 7.9 },
      { rank: 3, state: 'Telangana', production: 5.2 },
      { rank: 4, state: 'Rajasthan', production: 2.8 },
      { rank: 5, state: 'Haryana', production: 1.9 }
    ]
  },
  {
    crop: 'Sugarcane',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Uttar Pradesh', production: 198.5 },
      { rank: 2, state: 'Maharashtra', production: 112.4 },
      { rank: 3, state: 'Karnataka', production: 62.1 },
      { rank: 4, state: 'Tamil Nadu', production: 18.2 },
      { rank: 5, state: 'Bihar', production: 13.9 }
    ]
  },
  {
    crop: 'Maize',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Madhya Pradesh', production: 5.1 },
      { rank: 2, state: 'Karnataka', production: 4.8 },
      { rank: 3, state: 'Bihar', production: 3.5 },
      { rank: 4, state: 'Maharashtra', production: 3.2 },
      { rank: 5, state: 'Telangana', production: 2.9 }
    ]
  },
  {
    crop: 'Tea',
    unit: 'Million Kg',
    rankings: [
      { rank: 1, state: 'Assam', production: 692.4 },
      { rank: 2, state: 'West Bengal', production: 421.5 },
      { rank: 3, state: 'Tamil Nadu', production: 154.2 },
      { rank: 4, state: 'Kerala', production: 62.8 },
      { rank: 5, state: 'Tripura', production: 8.9 }
    ]
  },
  {
    crop: 'Coffee',
    unit: 'Thousand Tonnes',
    rankings: [
      { rank: 1, state: 'Karnataka', production: 242.0 },
      { rank: 2, state: 'Kerala', production: 74.3 },
      { rank: 3, state: 'Tamil Nadu', production: 18.5 },
      { rank: 4, state: 'Andhra Pradesh', production: 8.2 },
      { rank: 5, state: 'Odisha', production: 1.5 }
    ]
  },
  {
    crop: 'Pulses',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Madhya Pradesh', production: 8.4 },
      { rank: 2, state: 'Maharashtra', production: 4.9 },
      { rank: 3, state: 'Rajasthan', production: 4.8 },
      { rank: 4, state: 'Uttar Pradesh', production: 2.6 },
      { rank: 5, state: 'Karnataka', production: 2.2 }
    ]
  },
  {
    crop: 'Soybean',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Madhya Pradesh', production: 6.8 },
      { rank: 2, state: 'Maharashtra', production: 6.2 },
      { rank: 3, state: 'Rajasthan', production: 1.2 },
      { rank: 4, state: 'Karnataka', production: 0.4 },
      { rank: 5, state: 'Telangana', production: 0.3 }
    ]
  },
  {
    crop: 'Jute',
    unit: 'Million Bales (180kg)',
    rankings: [
      { rank: 1, state: 'West Bengal', production: 7.2 },
      { rank: 2, state: 'Bihar', production: 1.1 },
      { rank: 3, state: 'Assam', production: 0.8 },
      { rank: 4, state: 'Odisha', production: 0.1 },
      { rank: 5, state: 'Meghalaya', production: 0.08 }
    ]
  },
  {
    crop: 'Onion',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Maharashtra', production: 10.5 },
      { rank: 2, state: 'Madhya Pradesh', production: 4.6 },
      { rank: 3, state: 'Karnataka', production: 2.8 },
      { rank: 4, state: 'Gujarat', production: 2.5 },
      { rank: 5, state: 'Rajasthan', production: 1.2 }
    ]
  },
  {
    crop: 'Potato',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Uttar Pradesh', production: 16.2 },
      { rank: 2, state: 'West Bengal', production: 12.8 },
      { rank: 3, state: 'Bihar', production: 9.1 },
      { rank: 4, state: 'Gujarat', production: 4.2 },
      { rank: 5, state: 'Madhya Pradesh', production: 3.5 }
    ]
  },
  {
    crop: 'Bajra',
    unit: 'Million Tonnes',
    rankings: [
      { rank: 1, state: 'Rajasthan', production: 4.6 },
      { rank: 2, state: 'Uttar Pradesh', production: 2.1 },
      { rank: 3, state: 'Haryana', production: 1.2 },
      { rank: 4, state: 'Gujarat', production: 1.1 },
      { rank: 5, state: 'Madhya Pradesh', production: 0.8 }
    ]
  },
  {
    crop: 'Rubber',
    unit: 'Thousand Tonnes',
    rankings: [
      { rank: 1, state: 'Kerala', production: 602.5 },
      { rank: 2, state: 'Tripura', production: 92.4 },
      { rank: 3, state: 'Karnataka', production: 41.2 },
      { rank: 4, state: 'Tamil Nadu', production: 25.8 },
      { rank: 5, state: 'Assam', production: 21.1 }
    ]
  }
];
