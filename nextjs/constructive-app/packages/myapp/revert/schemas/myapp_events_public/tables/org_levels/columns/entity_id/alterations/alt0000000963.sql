-- Revert: schemas/myapp_events_public/tables/org_levels/columns/entity_id/alterations/alt0000000963


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN entity_id DROP NOT NULL;


