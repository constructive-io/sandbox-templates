-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/id/alterations/alt0000000968


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN id DROP NOT NULL;


