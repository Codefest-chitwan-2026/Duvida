-- ==============================================================================
-- TEAM EVEREST - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create ISSUES table (Community Reports)
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE, -- e.g. ISS-2026-08-01-40213
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'pothole', 'garbage', 'water', 'electricity', 'hazard', 'traffic', 'other'
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'in_progress', 'resolved', 'rejected'
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    city TEXT DEFAULT 'Kathmandu',
    ward TEXT,
    media_urls TEXT[] DEFAULT '{}',
    reported_by UUID,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create QUESTS table (Eco & Community Missions)
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    quest_type TEXT DEFAULT 'community', -- 'community', 'cleanup', 'energy', 'tree_plantation'
    points_reward INTEGER DEFAULT 100,
    vouchers_reward INTEGER DEFAULT 100,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
    issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create QUEST PARTICIPANTS table (Citizen Submissions & Proofs)
CREATE TABLE IF NOT EXISTS public.quest_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
    user_id UUID,
    status TEXT DEFAULT 'joined', -- 'joined', 'submitted', 'verified', 'completed'
    proof_before_url TEXT,
    proof_after_url TEXT,
    notes TEXT,
    joined_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 5. Create PROFILES & WALLETS table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'Community Member', -- 'Citizen', 'Community Champion', 'Moderator', 'Admin'
    vouchers_balance INTEGER DEFAULT 2450,
    xp INTEGER DEFAULT 2850,
    level INTEGER DEFAULT 12,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Row Level Security (RLS) and grant open access policies for development
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read & write during development/hackathon (Replace with strict auth policies for production)
CREATE POLICY "Allow public read on issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert on issues" ON public.issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on issues" ON public.issues FOR UPDATE USING (true);

CREATE POLICY "Allow public read on quests" ON public.quests FOR SELECT USING (true);
CREATE POLICY "Allow public insert on quests" ON public.quests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quests" ON public.quests FOR UPDATE USING (true);

CREATE POLICY "Allow public read on quest_participants" ON public.quest_participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert on quest_participants" ON public.quest_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quest_participants" ON public.quest_participants FOR UPDATE USING (true);

CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);

-- 7. Insert Initial Seed Data for Demo
INSERT INTO public.issues (title, description, category, severity, status, latitude, longitude, address, city)
VALUES 
  ('Deep Pothole on Main Road', 'Hazardous pothole causing traffic slowdown and safety risk.', 'pothole', 'high', 'verified', 27.7172, 85.3240, 'Durbar Marg, Kathmandu', 'Kathmandu'),
  ('Overflowing Waste Container', 'Community garbage bin overflowing near the park entrance.', 'garbage', 'medium', 'pending', 27.7120, 85.3180, 'Ratna Park, Kathmandu', 'Kathmandu'),
  ('Water Pipe Leakage', 'Clean drinking water pipe leaking onto the sidewalk.', 'water', 'high', 'in_progress', 27.7200, 85.3300, 'Lazimpat, Kathmandu', 'Kathmandu')
ON CONFLICT DO NOTHING;
