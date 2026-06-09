-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/level/alterations/alt0000000972


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN level DROP NOT NULL;


