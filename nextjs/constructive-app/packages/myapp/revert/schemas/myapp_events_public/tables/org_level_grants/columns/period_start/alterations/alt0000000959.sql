-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/alterations/alt0000000959


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN period_start DROP NOT NULL;


