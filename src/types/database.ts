export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_url: string
          logo_url: string | null
          widget_id: string
          plan: 'free' | 'pro' | 'enterprise'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_url: string
          logo_url?: string | null
          widget_id?: string
          plan?: 'free' | 'pro' | 'enterprise'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_url?: string
          logo_url?: string | null
          widget_id?: string
          plan?: 'free' | 'pro' | 'enterprise'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_email: string
          rating: number
          review_text: string
          photo_url: string | null
          sentiment_score: number | null
          sentiment_label: 'positive' | 'neutral' | 'negative' | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_email: string
          rating: number
          review_text: string
          photo_url?: string | null
          sentiment_score?: number | null
          sentiment_label?: 'positive' | 'neutral' | 'negative' | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_email?: string
          rating?: number
          review_text?: string
          photo_url?: string | null
          sentiment_score?: number | null
          sentiment_label?: 'positive' | 'neutral' | 'negative' | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      social_cards: {
        Row: {
          id: string
          review_id: string
          card_url: string
          platform: 'instagram' | 'twitter'
          shared_count: number
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          card_url: string
          platform: 'instagram' | 'twitter'
          shared_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          card_url?: string
          platform?: 'instagram' | 'twitter'
          shared_count?: number
          created_at?: string
        }
      }
    }
  }
}
