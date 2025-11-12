import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Business } from '../types';
import { Sparkles, Star, Upload, Check, Twitter, Facebook, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReviewForm: React.FC = () => {
  const { widgetId } = useParams<{ widgetId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 0,
    reviewText: '',
    photoFile: null as File | null
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    loadBusiness();
  }, [widgetId]);

  const loadBusiness = async () => {
    if (!widgetId) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('widget_id', widgetId)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error loading business:', error);
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!business) return;
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (formData.photoFile) {
        const fileExt = formData.photoFile.name.split('.').pop();
        const fileName = `${business.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(fileName, formData.photoFile);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo
        } else {
          const { data: urlData } = supabase.storage
            .from('review-photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // Insert review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          business_id: business.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          rating: formData.rating,
          review_text: formData.reviewText,
          photo_url: photoUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      toast.success('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, photoFile: file });
    }
  };

  const shareReview = (platform: string) => {
    const text = `I just left a review for ${business?.business_name}!`;
    const url = window.location.href;

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
          <p className="text-purple-200">The review page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
          <p className="text-purple-100 mb-8">
            Your review has been submitted and is pending approval. We appreciate your feedback!
          </p>

          <div className="mb-8">
            <p className="text-white font-semibold mb-4">Share your review:</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => shareReview('twitter')}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              >
                <Twitter className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => shareReview('facebook')}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              >
                <Facebook className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => shareReview('linkedin')}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              >
                <Linkedin className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20">
            <a
              href={business.business_url}
              className="text-purple-200 hover:text-white transition"
            >
              Visit {business.business_name} →
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2 text-white/60 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Powered by ProofViral</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {business.logo_url && (
            <img
              src={business.logo_url}
              alt={business.business_name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover shadow-xl"
            />
          )}
          <h1 className="text-4xl font-bold text-white mb-2">
            Share Your Experience
          </h1>
          <p className="text-purple-200 text-lg">
            Tell us about your experience with {business.business_name}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-white font-medium mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                placeholder="john@example.com"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-white font-medium mb-3">
                Rating *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || formData.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-white/40'
                      }`}
                    />
                  </button>
                ))}
                {formData.rating > 0 && (
                  <span className="ml-4 text-white font-semibold text-lg">
                    {formData.rating} {formData.rating === 1 ? 'Star' : 'Stars'}
                  </span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-white font-medium mb-2">
                Your Review *
              </label>
              <textarea
                required
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none"
                placeholder="Tell us about your experience..."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-white font-medium mb-2">
                Add Photo (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-dashed border-white/40 hover:bg-white/30 transition cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white">
                    {formData.photoFile ? formData.photoFile.name : 'Click to upload photo'}
                  </span>
                </label>
              </div>
              <p className="text-purple-200 text-sm mt-2">
                Maximum file size: 5MB
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-purple-600 py-4 rounded-lg font-semibold hover:bg-slate-50 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-center space-x-2 text-white/60 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Powered by ProofViral</span>
          </div>
        </div>
      </div>
    </div>
  );
};
