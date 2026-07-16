import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AvatarPicker from '../components/AvatarPicker';
import Stepper, { Step } from '../components/Stepper';
import RingBackground from '../components/RingBackground';
import { Target, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [stepperKey, setStepperKey] = useState(1);
  const navigate = useNavigate();

  const handleStepSubmit = async (step) => {
    if (step === 1) {
      if (!email || !password) {
        setError("Please enter your email and password.");
        throw new Error("Missing fields");
      }
      setLoading(true);
      setError(null);
      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        throw err; // Stop Stepper from advancing
      }
      setLoading(false);
    }
  };

  const handleAvatarDone = async ({ avatarId }) => {
    // Save avatar choice to profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ avatar_id: avatarId }).eq('id', user.id);
    }
    navigate('/');
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStepComplete = async () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen font-body flex items-center justify-center p-6 bg-transparent relative">
      <RingBackground />
      <div className="w-full max-w-md relative z-10">
        <Stepper
          key={stepperKey}
          initialStep={1}
          onStepChange={(s) => { /* Could track active step if needed */ }}
          onStepSubmit={handleStepSubmit}
          onFinalStepCompleted={handleStepComplete}
          backButtonText="Back"
          nextButtonText={isSignUp ? "SIGN UP" : "SIGN IN"}
          disableStepIndicators={true}
          stepContainerClassName="hidden"
        >
          <Step>
            <div className="flex flex-col items-center mb-8 mt-4">
              <Target className="w-8 h-8 text-neo-green-dark mb-4" strokeWidth={2.5} />
              <h1 className="font-heading text-4xl md:text-5xl uppercase tracking-widest text-center mb-2" style={{ color: 'var(--color-neo-cream)' }}>
                {isSignUp ? "SIGN UP" : "LOGIN"}
              </h1>
              <p className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/50 text-center">
                CROPCALM - ANIMAL DETERRENT SYSTEM
              </p>
            </div>
            {error && (
              <div className="border-2 border-neo-cream/40 bg-neo-green-dark/30 p-4 mb-4 rounded-xl">
                <p className="font-subheading text-sm text-center text-neo-cream">{error}</p>
              </div>
            )}
            <form id="auth-form" onSubmit={(e) => { e.preventDefault(); /* Handled by Stepper Next */ }} className="flex flex-col gap-4 text-neo-cream">
              <div>
                <label className="block font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border-2 border-neo-cream/40 rounded-xl px-4 py-3 font-body text-neo-cream placeholder-neo-cream/20 focus:outline-none focus:border-neo-cream transition-colors bg-neo-dark"
                  placeholder="farmer@cropcalm.com" />
              </div>
              <div>
                <label className="block font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full border-2 border-neo-cream/40 rounded-xl px-4 py-3 font-body text-neo-cream placeholder-neo-cream/20 focus:outline-none focus:border-neo-cream transition-colors bg-neo-dark"
                    placeholder="••••••••" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neo-cream/40 hover:text-neo-cream transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-8 text-center px-4">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setStepperKey(k => k+1); }} className="font-subheading text-[10px] uppercase tracking-widest text-neo-cream/60 hover:text-neo-cream transition-colors leading-relaxed">
                {isSignUp ? 'ALREADY HAVE AN ACCOUNT? LOG IN' : 'NEW USERNAME? A NEW ACCOUNT WILL BE CREATED AUTOMATICALLY (CLICK TO SIGN UP)'}
              </button>
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
