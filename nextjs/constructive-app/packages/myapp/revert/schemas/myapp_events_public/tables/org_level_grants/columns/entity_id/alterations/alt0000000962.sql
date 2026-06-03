-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/entity_id/alterations/alt0000000962


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN entity_id DROP NOT NULL;


