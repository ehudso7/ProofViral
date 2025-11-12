import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Business } from '../types';
import { Building, Upload, Save, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_url: '',
    logo_url: ''
  });

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
      setFormData({
        business_name: data.business_name,
        business_url: data.business_url,
        logo_url: data.logo_url || ''
      });
    } catch (error) {
      console.error('Error loading business:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          business_name: formData.business_name,
          business_url: formData.business_url,
          logo_url: formData.logo_url || null
        })
        .eq('id', business.id);

      if (error) throw error;

      setBusiness({ ...business, ...formData, logo_url: formData.logo_url || null });
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${business.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('business-logos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, logo_url: urlData.publicUrl });
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Settings</h1>
        <p className="text-slate-600">Manage your business profile and preferences</p>
      </div>

      {/* Settings Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Name */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Business Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Business Website</span>
                  </div>
                </label>
                <input
                  type="url"
                  required
                  value={formData.business_url}
                  onChange={(e) => setFormData({ ...formData, business_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Business Logo</h2>
            </div>

            <div className="space-y-4">
              {formData.logo_url && (
                <div className="flex items-center space-x-4">
                  <img
                    src={formData.logo_url}
                    alt="Business logo"
                    className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Current logo</p>
                  </div>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload New Logo</span>
                </label>
                <p className="text-sm text-slate-500 mt-2">
                  Recommended: Square image, at least 200x200px, max 2MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Or enter logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="text-slate-900 font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Widget ID:</span>
                <span className="text-slate-900 font-mono text-xs">{business?.widget_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Member since:</span>
                <span className="text-slate-900 font-medium">
                  {business && new Date(business.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
