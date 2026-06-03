-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/updated_at/column


ALTER TABLE myapp_events_public.app_level_grants 
  DROP COLUMN updated_at RESTRICT;


