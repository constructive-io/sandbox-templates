-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/name/alterations/alt0000000970


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN name DROP NOT NULL;


