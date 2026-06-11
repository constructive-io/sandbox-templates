-- Revert: schemas/myapp_events_public/tables/app_levels/columns/updated_at/column


ALTER TABLE myapp_events_public.app_levels 
  DROP COLUMN updated_at RESTRICT;


