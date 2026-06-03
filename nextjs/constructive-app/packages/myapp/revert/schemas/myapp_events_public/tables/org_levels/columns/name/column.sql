-- Revert: schemas/myapp_events_public/tables/org_levels/columns/name/column


ALTER TABLE myapp_events_public.org_levels 
  DROP COLUMN name RESTRICT;


