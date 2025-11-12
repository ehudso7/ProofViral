import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Business } from '../types';
import { CreditCard, Check, Zap, Crown, Building } from 'lucide-react';
import toast from 'react-hot-toast';


export const Billing: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [user]);

  const loadBusiness = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error loading business:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'free' | 'pro' | 'enterprise') => {
    if (!business) return;

    // In production, this would create a Stripe Checkout session
    // For now, we'll just update the plan directly
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ plan })
        .eq('id', business.id);

      if (error) throw error;

      setBusiness({ ...business, plan });
      toast.success(`Successfully upgraded to ${plan.toUpperCase()} plan!`);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const plans = [
    {
      name: 'Free',
      key: 'free' as const,
      price: '$0',
      period: 'forever',
      icon: Zap,
      color: 'slate',
      features: [
        '10 reviews per month',
        'Basic widget',
        'Email support',
        'ProofViral branding'
      ]
    },
    {
      name: 'Pro',
      key: 'pro' as const,
      price: '$49',
      period: 'per month',
      icon: Crown,
      color: 'purple',
      features: [
        'Unlimited reviews',
        'AI sentiment analysis',
        'Social card generator',
        'Custom branding',
        'Advanced analytics',
        'Priority support'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      key: 'enterprise' as const,
      price: '$99',
      period: 'per month',
      icon: Building,
      color: 'blue',
      features: [
        'Everything in Pro',
        'White-label solution',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        '99.9% SLA'
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Subscription</h1>
        <p className="text-slate-600">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-1">Current Plan</p>
            <h2 className="text-3xl font-bold capitalize">{business?.plan} Plan</h2>
          </div>
          <CreditCard className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = business?.plan === plan.key;
          const Icon = plan.icon;

          return (
            <div
              key={plan.key}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${
                plan.popular ? 'border-purple-600' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 bg-${plan.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 text-${plan.color}-600`} />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-600 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.key === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Billing Info */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Information</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 text-sm">
              <strong>Note:</strong> This is a demo application. In production, Stripe integration would handle
              secure payment processing, subscription management, and invoicing.
            </p>
          </div>

          {business?.plan !== 'free' && (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Next billing date</p>
                <p className="text-sm text-slate-600">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <button className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition font-medium">
                Manage
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
