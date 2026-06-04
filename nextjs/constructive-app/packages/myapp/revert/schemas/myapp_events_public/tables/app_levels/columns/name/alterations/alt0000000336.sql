-- Revert: schemas/myapp_events_public/tables/app_levels/columns/name/alterations/alt0000000336


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN name DROP NOT NULL;


