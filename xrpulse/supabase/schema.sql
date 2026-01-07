-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Public Metadata for Wallet Addresses)
create table profiles (
  id uuid references auth.users on delete cascade, -- Optional: Link to Supabase Auth if we use it, otherwise nullable
  wallet_address text primary key,
  role text check (role in ('clinic', 'investor')),
  name text,
  location text, -- For Clinics
  license_number text, -- For Clinics
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ASSETS (Off-chain metadata for the On-chain NFTs)
create table assets (
  id uuid default uuid_generate_v4() primary key,
  clinic_wallet text references profiles(wallet_address) not null,
  title text not null, -- e.g., "Siemens Magnetom MRI"
  description text,
  image_url text,
  
  -- Financial Targets
  funding_goal_rlusd numeric not null,
  total_shares integer not null, -- e.g., 1000 tokens
  share_price_rlusd numeric not null, -- e.g., 500 RLUSD
  
  -- XRPL Linkage
  token_id text, -- The NFT ID (URITokenID)
  currency_code text, -- e.g., "PULSE-MRI-001"
  escrow_sequence integer, -- The generic marker for the escrow if needed
  
  status text check (status in ('draft', 'funding', 'funded', 'active')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVESTMENTS (Off-chain Indexer for UI speed)
-- In a real app, we would listen to ledger txs. Here we just write to DB on success.
create table investments (
  id uuid default uuid_generate_v4() primary key,
  asset_id uuid references assets(id) not null,
  investor_wallet text references profiles(wallet_address) not null,
  amount_tokens numeric not null,
  amount_rlusd numeric not null,
  tx_hash text not null, -- CRITICAL: Proof of Trust
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (Simple for Hackathon)
alter table profiles enable row level security;
alter table assets enable row level security;
alter table investments enable row level security;

-- Policies (Public Read, Public Write for Demo - Secure this for Prod!)
create policy "Public Read Profiles" on profiles for select using (true);
create policy "Public Insert Profiles" on profiles for insert with check (true);
create policy "Public Update Profiles" on profiles for update using (true);

create policy "Public Read Assets" on assets for select using (true);
create policy "Public Insert Assets" on assets for insert with check (true);
create policy "Public Update Assets" on assets for update using (true);

create policy "Public Read Investments" on investments for select using (true);
create policy "Public Insert Investments" on investments for insert with check (true);
