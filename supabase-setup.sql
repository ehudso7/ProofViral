-- ProofViral Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_url TEXT NOT NULL,
    logo_url TEXT,
    widget_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    photo_url TEXT,
    sentiment_score FLOAT CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
    sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create social_cards table
CREATE TABLE IF NOT EXISTS public.social_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    card_url TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter')),
    shared_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_widget_id ON public.businesses(widget_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_social_cards_review_id ON public.social_cards(review_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_cards ENABLE ROW LEVEL SECURITY;

-- Businesses Policies
CREATE POLICY "Users can view their own business"
    ON public.businesses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business"
    ON public.businesses FOR UPDATE
    USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Anyone can insert reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Business owners can view their reviews"
    ON public.reviews FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can update their reviews"
    ON public.reviews FOR UPDATE
    USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view approved reviews for widgets"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

-- Social Cards Policies
CREATE POLICY "Business owners can view their social cards"
    ON public.social_cards FOR SELECT
    USING (
        review_id IN (
            SELECT r.id FROM public.reviews r
            JOIN public.businesses b ON r.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can insert social cards"
    ON public.social_cards FOR INSERT
    WITH CHECK (
        review_id IN (
            SELECT r.id FROM public.reviews r
            JOIN public.businesses b ON r.business_id = b.id
            WHERE b.user_id = auth.uid()
        )
    );

-- Create Storage Buckets (run these from Supabase Storage UI or API)
-- 1. Create bucket: review-photos (public)
-- 2. Create bucket: business-logos (public)
-- 3. Create bucket: social-cards (public)

-- Storage Policies (after creating buckets)
-- For review-photos bucket:
-- CREATE POLICY "Anyone can upload review photos"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'review-photos');

-- CREATE POLICY "Review photos are publicly accessible"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'review-photos');

-- For business-logos bucket:
-- CREATE POLICY "Authenticated users can upload logos"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'business-logos' AND auth.role() = 'authenticated');

-- CREATE POLICY "Business logos are publicly accessible"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'business-logos');
