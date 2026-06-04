-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/priority/alterations/alt0000000945


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN priority DROP NOT NULL;


