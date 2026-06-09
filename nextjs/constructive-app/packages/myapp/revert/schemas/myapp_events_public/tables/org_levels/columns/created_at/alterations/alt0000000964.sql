-- Revert: schemas/myapp_events_public/tables/org_levels/columns/created_at/alterations/alt0000000964


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN created_at DROP DEFAULT;


