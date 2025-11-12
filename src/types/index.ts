export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_url: string;
  logo_url: string | null;
  widget_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  photo_url: string | null;
  sentiment_score: number | null;
  sentiment_label: 'positive' | 'neutral' | 'negative' | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SocialCard {
  id: string;
  review_id: string;
  card_url: string;
  platform: 'instagram' | 'twitter';
  shared_count: number;
  created_at: string;
}

export interface SentimentAnalysis {
  sentiment_score: number;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  key_themes: string[];
}
