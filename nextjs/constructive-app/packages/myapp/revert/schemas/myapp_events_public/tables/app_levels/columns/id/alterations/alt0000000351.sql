-- Revert: schemas/myapp_events_public/tables/app_levels/columns/id/alterations/alt0000000351


ALTER TABLE myapp_events_public.app_levels 
  ALTER COLUMN id DROP NOT NULL;


