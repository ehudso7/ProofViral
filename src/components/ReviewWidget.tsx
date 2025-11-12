import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Business, Review } from '../types';
import { Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

interface ReviewWidgetProps {
  widgetId: string;
}

export const ReviewWidget: React.FC<ReviewWidgetProps> = ({ widgetId }) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgetData();
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(reviews.length, 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [widgetId, reviews.length]);

  const loadWidgetData = async () => {
    try {
      // Load business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('widget_id', widgetId)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Load approved 5-star reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessData.id)
        .eq('status', 'approved')
        .eq('rating', 5)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error loading widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!business || reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No reviews yet</p>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];
  const avgRating = 5; // Since we're only showing 5-star reviews

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg p-6 max-w-2xl mx-auto border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-5 h-5 text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>
          <p className="text-sm text-slate-600">
            {avgRating} out of 5 stars • {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
        {business.logo_url && (
          <img
            src={business.logo_url}
            alt={business.business_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
      </div>

      {/* Review Carousel */}
      <div className="relative min-h-[200px] mb-6">
        <div className="space-y-4">
          {currentReview.photo_url && (
            <img
              src={currentReview.photo_url}
              alt="Review"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          <p className="text-slate-700 italic leading-relaxed">
            "{currentReview.review_text}"
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                {currentReview.customer_name}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(currentReview.created_at).toLocaleDateString()}
              </p>
            </div>

            {reviews.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevious}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <a
        href={`${window.location.origin}/review/${widgetId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
      >
        Leave a Review
      </a>

      {/* Powered By */}
      <div className="mt-4 text-center">
        <a
          href="https://proofviral.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Powered by ProofViral
        </a>
      </div>
    </div>
  );
};
