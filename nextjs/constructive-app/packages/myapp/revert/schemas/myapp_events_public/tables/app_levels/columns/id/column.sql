-- Revert: schemas/myapp_events_public/tables/app_levels/columns/id/column


ALTER TABLE myapp_events_public.app_levels 
  DROP COLUMN id RESTRICT;


