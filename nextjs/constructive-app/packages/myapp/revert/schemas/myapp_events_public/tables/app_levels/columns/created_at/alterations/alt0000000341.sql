-- Revert: schemas/myapp_events_public/tables/app_levels/columns/created_at/alterations/alt0000000341


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN created_at DROP DEFAULT;


