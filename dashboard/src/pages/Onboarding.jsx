import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { provisionDevices, buildThreatProfile } from '../lib/deviceSetup';
import Stepper, { Step } from '../components/Stepper';
import AvatarPicker from '../components/AvatarPicker';
import OnboardingBackground from '../components/OnboardingBackground';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';

const ANIMALS = [
  'Wild Boar', 'Nilgai', 'Monkey', 'Elephant', 'Leopard', 'Deer',
  'Jackal', 'Stray Dogs', 'Rabbit', 'Crow', 'Porcupine', 'Peafowl',
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

const STEPS = ['Personal Info', 'Avatar', 'Location', 'Animal Sightings', 'Your Profile'];

export default function Onboarding() {
  const [activeStep, setActiveStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    village: '',
    state: 'Maharashtra',
    lat: null,
    lng: null,
    animals: [],
    avatar: 1,
  });

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAnimal = (animal) => {
    setForm((f) => ({
      ...f,
      animals: f.animals.includes(animal)
        ? f.animals.filter((a) => a !== animal)
        : [...f.animals, animal],
    }));
  };

  const getGPS = async () => {
    setGpsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateForm('lat', lat);
        updateForm('lng', lng);

        // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address;

          // Extract village/town name, prioritizing smaller localities
          const village =
            addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.county || addr.city || '';

          // Extract Indian state name (Nominatim might return different properties depending on the region)
          // For Union Territories like Delhi, the state is often entirely missing, so we fallback to scanning the city name
          const rawState = addr.state || addr.state_district || addr.region || addr.city || addr.town || addr.county || '';
          
          let matchedState = null;
          
          if (rawState && rawState.trim().length > 2) {
            // Try an exact/partial match against the official list
            matchedState = INDIAN_STATES.find((s) =>
              rawState.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rawState.toLowerCase())
            );
            
            // Fallback: match by the first word (e.g. "Andhra" for "Andhra Pradesh") if the word is substantial
            if (!matchedState) {
              matchedState = INDIAN_STATES.find((s) => {
                const firstWord = s.toLowerCase().split(' ')[0];
                return firstWord.length > 3 && rawState.toLowerCase().includes(firstWord);
              });
            }
          }

          if (village) updateForm('village', village);
          if (matchedState) updateForm('state', matchedState);
        } catch (e) {
          console.error("GPS Geocode error:", e);
          // GPS coordinates saved, but autofill failed silently
        }

        setGpsLoading(false);
      },
      () => {
        setError('Could not access GPS. Please enter your location manually.');
        setGpsLoading(false);
      }
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const threatProfile = buildThreatProfile(form.animals);

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: form.name,
        phone: form.phone,
        village: form.village,
        state: form.state,
        lat: form.lat,
        lng: form.lng,
        animal_sightings: form.animals,
        threat_profile: threatProfile,
        onboarding_done: true,
        avatar_id: form.avatar,
      });

      if (profileError) throw profileError;

      await provisionDevices(user.id);
      // Force a hard reload so App.jsx pulls the fresh profile state from Supabase
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (form.name.trim().length <= 2) return "Please enter a valid full name (at least 3 characters).";
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) return "Please enter a valid 10-digit Indian mobile number.";
    }
    if (step === 3) {
      if (form.village.trim().length === 0) return "Please enter your village or town name.";
    }
    if (step === 4) {
      if (form.animals.length === 0) return "Please select at least one animal to continue.";
    }
    return null;
  };

  const handleStepSubmit = async (step) => {
    const errorMsg = validateStep(step);
    if (errorMsg) {
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    setError(null);
  };

  const threatProfile = buildThreatProfile(form.animals);
  const threatColors = {
    LOW: 'text-green-400', MEDIUM: 'text-yellow-400',
    HIGH: 'text-orange-400', CRITICAL: 'text-red-400'
  };

  return (
    <div className="min-h-screen text-neo-cream font-body flex flex-col items-center p-6 bg-transparent relative">
      <OnboardingBackground step={activeStep} isSaving={saving} />
      <div className="w-full max-w-xl mt-4 relative z-10">
        {error && (
          <div className="border-2 border-red-500/40 bg-red-500/10 p-4 mb-4 rounded-xl flex items-center justify-center animate-fadeIn">
            <p className="font-subheading text-xs uppercase tracking-widest text-red-400">{error}</p>
          </div>
        )}
        <Stepper
          initialStep={1}
          onStepChange={(s) => { setActiveStep(s); setError(null); }}
          onStepSubmit={handleStepSubmit}
          onFinalStepCompleted={handleFinish}
          backButtonText="Back"
          nextButtonText={activeStep === 5 ? (saving ? 'Setting Up Farm...' : 'Launch Dashboard') : 'Next'}
          nextButtonProps={{ disabled: saving }}
          stepCircleContainerClassName="border-2 border-neo-cream shadow-[8px_8px_0px_var(--color-neo-cream)] animate-fadeIn w-full max-w-full"
        >
          {/* Step 1: Personal Info */}
          <Step>
            <div className="pb-8">
              <h2 className="font-heading text-3xl uppercase mb-2">Tell Us About You</h2>
            <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-8">
              Your personal information helps us personalize your farm dashboard.
            </p>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
                  Full Name *
                </label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full bg-neo-dark border-2 border-neo-cream/50 rounded-xl px-4 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors"
                  placeholder="e.g. Aradhy Krishna"
                />
              </div>
              <div>
                <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
                  Phone Number
                </label>
                <div className="flex items-center w-full bg-neo-dark border-2 border-neo-cream/50 rounded-xl px-4 py-3 font-body text-neo-cream focus-within:border-neo-cream transition-colors">
                  <span className="text-neo-cream/50 mr-2 border-r border-neo-cream/20 pr-2">+91</span>
                  <input
                    type="tel" value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none"
                    placeholder="98765 43210"
                  />
                </div>
              </div>
            </div>
            </div>
          </Step>

          {/* Step 2: Avatar */}
          <Step>
            <div className="pb-8">
              <h2 className="font-heading text-3xl uppercase mb-2">Choose Your Avatar</h2>
              <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-8">
                Pick a guardian identity to represent you.
              </p>
              <AvatarPicker
                value={form.avatar}
                onChange={(id) => updateForm('avatar', id)}
              />
            </div>
          </Step>

          {/* Step 3: Location */}
          <Step>
            <div className="pb-8">
              <h2 className="font-heading text-3xl uppercase mb-2">Your Farm Location</h2>
            <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-8">
              Used to approximate local wildlife threats in your region.
            </p>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
                  Village / Town *
                </label>
                <input
                  type="text" value={form.village}
                  onChange={(e) => updateForm('village', e.target.value)}
                  className="w-full bg-neo-dark border-2 border-neo-cream/50 rounded-xl px-4 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors"
                  placeholder="e.g. Wardha, Amravati"
                />
              </div>
              <div>
                <label className="block font-subheading text-xs uppercase tracking-widest text-neo-cream/70 mb-2">
                  State
                </label>
                <select
                  value={form.state}
                  onChange={(e) => updateForm('state', e.target.value)}
                  className="w-full bg-neo-dark border-2 border-neo-cream/50 rounded-xl px-4 py-3 font-body text-neo-cream focus:outline-none focus:border-neo-cream transition-colors"
                >
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={getGPS}
                disabled={gpsLoading}
                className="flex items-center justify-center gap-2 border-2 border-neo-cream/40 text-neo-cream rounded-xl py-3 font-subheading font-bold text-xs uppercase tracking-widest hover:border-neo-cream hover:bg-neo-cream/10 transition-all disabled:opacity-50"
              >
                {gpsLoading
                  ? 'Detecting Location...'
                  : form.lat
                  ? `GPS Acquired: ${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}`
                  : 'Auto-Fill From GPS'}
              </button>
              {form.lat && (
                <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/40 text-center">
                  Village and state fields filled automatically from GPS
                </p>
              )}
            </div>
            </div>
          </Step>

          {/* Step 3: Animal Sightings */}
          <Step>
            <div className="pb-8">
              <h2 className="font-heading text-3xl uppercase mb-2">Animal Sightings</h2>
            <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-6">
              Select all animals spotted near your farm. This builds your threat profile.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {ANIMALS.map((name) => {
                const selected = form.animals.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleAnimal(name)}
                    className={`border-2 rounded-xl p-3 font-subheading text-xs uppercase tracking-wider transition-all ${
                      selected
                        ? 'border-neo-cream bg-neo-green-dark shadow-[3px_3px_0px_var(--color-neo-cream)]'
                        : 'border-neo-cream/30 hover:border-neo-cream/70'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            {form.animals.length === 0 && (
              <p className="text-center text-neo-cream/40 font-subheading text-xs uppercase tracking-widest mt-4">
                Select at least one animal to continue
              </p>
            )}
            </div>
          </Step>

          {/* Step 4: Threat Profile Summary */}
          <Step>
            <div className="pb-8">
              <h2 className="font-heading text-3xl uppercase mb-2">Your Threat Profile</h2>
            <p className="font-subheading text-xs uppercase tracking-widest text-neo-cream/50 mb-6">
              Based on your location and animal sightings.
            </p>

            <div className="neo-card border-2 border-neo-cream rounded-xl p-5 mb-6">
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 mb-1">Overall Risk Level</p>
              <p className={`font-heading text-4xl uppercase ${threatColors[threatProfile.overallLevel] || 'text-neo-cream'}`}>
                {threatProfile.overallLevel}
              </p>
              <p className="font-subheading text-xs text-neo-cream/60 mt-1 uppercase tracking-widest">
                {form.village}, {form.state}
              </p>
            </div>

            <div className="w-full pb-4 h-[300px]">
              <ScrollStack
                className="h-full w-full rounded-xl"
                itemDistance={16}
                itemScale={0.04}
                itemStackDistance={20}
                stackPosition="0%"
                scaleEndPosition="5%"
                baseScale={0.9}
                useWindowScroll={false}
              >
                {threatProfile.threats.map((t) => (
                    <ScrollStackItem key={t.animal} itemClassName="w-full">
                      <div className="border border-neo-cream/30 bg-[#121212] rounded-xl p-3 flex gap-3 items-start shadow-[4px_4px_0px_rgba(244,231,213,0.15)] w-full">
                        <span className={`font-subheading font-bold text-[10px] uppercase tracking-widest mt-0.5 whitespace-nowrap ${threatColors[t.level]}`}>
                          {t.level}
                        </span>
                        <div>
                          <p className="font-subheading font-bold text-sm">
                            {t.animal} <span className="text-neo-cream/40 font-normal">· {t.time}</span>
                          </p>
                          <p className="text-xs text-neo-cream/60 mt-0.5">{t.notes}</p>
                        </div>
                      </div>
                    </ScrollStackItem>
                ))}
              </ScrollStack>
            </div>
            </div>
          </Step>
        </Stepper>

        {/* Error */}
        {error && (
          <p className="text-red-400 font-subheading text-xs uppercase tracking-widest mt-4 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
