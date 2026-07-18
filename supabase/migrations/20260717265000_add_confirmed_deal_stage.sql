-- PostgreSQL does not allow a newly added enum value to be used safely until
-- this migration commits. Keep it before the campaign-trigger migration.
alter type public.studio_deal_stage add value if not exists 'confirmed';
