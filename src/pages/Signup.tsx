import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessUrl, setBusinessUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user account
      await signUp(email, password);

      // Wait a moment for auth to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the newly created user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Failed to get user after signup');
      }

      // Create business profile
      const { error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          business_name: businessName,
          business_url: businessUrl,
          widget_id: crypto.randomUUID(),
          plan: 'free'
        });

      if (businessError) throw businessError;

      toast.success('Account created! Welcome to ProofViral!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-xl">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ProofViral</h1>
          <p className="text-purple-200">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-white mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="businessUrl" className="block text-sm font-medium text-white mb-2">
                Business Website
              </label>
              <input
                id="businessUrl"
                type="url"
                required
                value={businessUrl}
                onChange={(e) => setBusinessUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/80">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-200 hover:text-white font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-white/80 hover:text-white transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};
