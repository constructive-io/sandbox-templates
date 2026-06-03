-- Revert: schemas/myapp_events_public/tables/app_level_grants/columns/level_name/alterations/alt0000000366


ALTER TABLE myapp_events_public.app_level_grants 
  ALTER COLUMN level_name DROP NOT NULL;


