-- Revert: schemas/myapp_events_public/tables/org_levels/columns/updated_at/alterations/alt0000000932


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN updated_at DROP DEFAULT;


