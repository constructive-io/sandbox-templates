-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/period_start/alterations/alt0000000993


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN period_start DROP DEFAULT;


