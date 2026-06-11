-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/required_count/alterations/alt0000000975


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN required_count DROP NOT NULL;


