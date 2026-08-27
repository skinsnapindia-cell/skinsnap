-- Migration: add the flat/building + locality columns to an EXISTING orders
-- table (for projects created before these fields were added).
--
-- Run once in Supabase > SQL Editor. Safe to re-run.

alter table public.orders add column if not exists flat_building text;
alter table public.orders add column if not exists locality text;

notify pgrst, 'reload schema';
