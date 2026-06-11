-- Revert: schemas/myapp_events_public/tables/org_level_grants/columns/level_name/alterations/alt0000000990


ALTER TABLE myapp_events_public.org_level_grants 
  ALTER COLUMN level_name DROP NOT NULL;


