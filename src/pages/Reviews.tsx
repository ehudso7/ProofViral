import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { analyzeSentiment } from '../utils/sentiment';
import { generateSocialCard } from '../utils/socialCard';
import type { Business, Review } from '../types';
import {
  Star,
  Filter,

  Check,
  X,
  Brain,
  Share2,

  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export const Reviews: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [user]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.status === filter));
    }
  }, [filter, reviews]);

  const loadReviews = async () => {
    if (!user) return;

    try {
      // Load business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status } : r));
      toast.success(`Review ${status}`);
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleAnalyzeSentiment = async (review: Review) => {
    setAnalyzingId(review.id);

    try {
      const analysis = await analyzeSentiment(review.review_text);

      const { error } = await supabase
        .from('reviews')
        .update({
          sentiment_score: analysis.sentiment_score,
          sentiment_label: analysis.sentiment_label
        })
        .eq('id', review.id);

      if (error) throw error;

      setReviews(reviews.map(r =>
        r.id === review.id
          ? {
              ...r,
              sentiment_score: analysis.sentiment_score,
              sentiment_label: analysis.sentiment_label
            }
          : r
      ));

      toast.success('Sentiment analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast.error('Failed to analyze sentiment');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleGenerateSocialCard = async (review: Review) => {
    if (!business) return;

    setGeneratingCardId(review.id);

    try {
      const blob = await generateSocialCard({
        reviewText: review.review_text,
        customerName: review.customer_name,
        rating: review.rating,
        businessName: business.business_name,
        logoUrl: business.logo_url || undefined,
        platform: 'instagram'
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-${review.id}-social-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to database
      const { error } = await supabase
        .from('social_cards')
        .insert({
          review_id: review.id,
          card_url: url,
          platform: 'instagram',
          shared_count: 0
        });

      if (error) console.error('Error saving social card:', error);

      toast.success('Social card generated and downloaded!');
    } catch (error) {
      console.error('Error generating social card:', error);
      toast.error('Failed to generate social card');
    } finally {
      setGeneratingCardId(null);
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Review Management</h1>
        <p className="text-slate-600">Manage and moderate your customer reviews</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center space-x-1 p-2">
          {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === status
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
              {status === 'all' && ` (${reviews.length})`}
              {status === 'pending' && ` (${reviews.filter(r => r.status === 'pending').length})`}
              {status === 'approved' && ` (${reviews.filter(r => r.status === 'approved').length})`}
              {status === 'rejected' && ` (${reviews.filter(r => r.status === 'rejected').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No {filter !== 'all' && filter} reviews found
          </h3>
          <p className="text-slate-600">
            {filter === 'all'
              ? 'Share your review collection page to start receiving testimonials'
              : `There are no ${filter} reviews at the moment`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {review.customer_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        review.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : review.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{review.customer_email}</span>
                  </div>
                </div>

                {review.photo_url && (
                  <img
                    src={review.photo_url}
                    alt="Review attachment"
                    className="w-20 h-20 object-cover rounded-lg ml-4"
                  />
                )}
              </div>

              <p className="text-slate-700 mb-4">{review.review_text}</p>

              {/* Sentiment Display */}
              {review.sentiment_label && (
                <div className="flex items-center space-x-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      review.sentiment_label === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : review.sentiment_label === 'neutral'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {review.sentiment_label.toUpperCase()}
                  </span>
                  {review.sentiment_score && (
                    <span className="text-sm text-slate-600">
                      Sentiment Score: {(review.sentiment_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {review.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleAnalyzeSentiment(review)}
                  disabled={analyzingId === review.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium disabled:opacity-50"
                >
                  {analyzingId === review.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span>{review.sentiment_label ? 'Re-analyze' : 'Analyze'}</span>
                </button>

                <button
                  onClick={() => handleGenerateSocialCard(review)}
                  disabled={generatingCardId === review.id}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium disabled:opacity-50"
                >
                  {generatingCardId === review.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span>Generate Social Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
