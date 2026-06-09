-- Revert: schemas/myapp_events_public/tables/org_levels/columns/name/alterations/alt0000000958


ALTER TABLE myapp_events_public.org_levels 
  ALTER COLUMN name DROP NOT NULL;


