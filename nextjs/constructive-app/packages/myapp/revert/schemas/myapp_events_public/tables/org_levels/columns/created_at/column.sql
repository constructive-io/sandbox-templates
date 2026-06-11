-- Revert: schemas/myapp_events_public/tables/org_levels/columns/created_at/column


ALTER TABLE myapp_events_public.org_levels 
  DROP COLUMN created_at RESTRICT;


