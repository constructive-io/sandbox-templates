-- Revert: schemas/myapp_events_public/tables/org_levels/columns/updated_at/column


ALTER TABLE myapp_events_public.org_levels 
  DROP COLUMN updated_at RESTRICT;


