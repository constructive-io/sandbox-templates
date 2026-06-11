-- Revert: schemas/myapp_events_public/tables/app_levels/columns/owner_id/column


ALTER TABLE myapp_events_public.app_levels 
  DROP COLUMN owner_id RESTRICT;


