-- Revert: schemas/myapp_events_public/tables/app_levels/columns/created_at/column


ALTER TABLE myapp_events_public.app_levels 
  DROP COLUMN created_at RESTRICT;


