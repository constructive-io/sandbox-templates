-- Revert: schemas/myapp_events_public/tables/app_levels/columns/updated_at/alterations/alt0000000342


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN updated_at DROP DEFAULT;


