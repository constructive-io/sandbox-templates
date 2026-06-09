-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/entity_id/alterations/alt0000000981


ALTER TABLE myapp_events_public.org_level_requirements 
  ALTER COLUMN entity_id DROP NOT NULL;


