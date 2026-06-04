-- Revert: schemas/myapp_events_public/tables/app_levels/columns/image/column


ALTER TABLE myapp_events_public.app_levels 
  DROP COLUMN image RESTRICT;


