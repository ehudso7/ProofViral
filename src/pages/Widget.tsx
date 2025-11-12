import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Business } from '../types';
import { ReviewWidget } from '../components/ReviewWidget';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const Widget: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const embedCode = business
    ? `<!-- ProofViral Review Widget -->
<div id="proofviral-widget-${business.widget_id}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.setAttribute('data-widget-id', '${business.widget_id}');
    document.body.appendChild(script);
  })();
</script>`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">Failed to load business data</p>
        </div>
      </div>
    );
  }

  const reviewPageUrl = `${window.location.origin}/review/${business.widget_id}`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Widget & Embed Code</h1>
        <p className="text-slate-600">Add reviews to your website with a simple embed code</p>
      </div>

      {/* Review Collection URL */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Review Collection Page</h2>
        <p className="text-slate-600 mb-4">
          Share this URL with customers to collect reviews:
        </p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={reviewPageUrl}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-sm"
          />
          <a
            href={reviewPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center space-x-2"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Visit</span>
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(reviewPageUrl);
              toast.success('URL copied!');
            }}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center space-x-2"
          >
            <Copy className="w-5 h-5" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Embed Code</h2>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <p className="text-slate-600 mb-4">
          Copy and paste this code into your website's HTML where you want the widget to appear:
        </p>

        <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
          <pre className="text-green-400 font-mono text-sm">
            <code>{embedCode}</code>
          </pre>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Code className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Implementation Note:</p>
              <p>
                The widget will automatically display your top 5-star reviews in a beautiful carousel.
                It updates in real-time as you approve new reviews from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Preview */}
      <div className="bg-slate-100 rounded-xl p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 text-center">Live Preview</h2>
        <p className="text-slate-600 mb-6 text-center">
          This is how your widget will look on your website
        </p>
        <ReviewWidget widgetId={business.widget_id} />
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">How to Use</h2>
        <ol className="space-y-3 text-slate-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              1
            </span>
            <span>Copy the embed code above</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              2
            </span>
            <span>Paste it into your website's HTML where you want reviews to appear</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              3
            </span>
            <span>The widget will automatically load and display your approved reviews</span>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
              4
            </span>
            <span>Share your review collection URL to start gathering testimonials</span>
          </li>
        </ol>
      </div>
    </div>
  );
};
