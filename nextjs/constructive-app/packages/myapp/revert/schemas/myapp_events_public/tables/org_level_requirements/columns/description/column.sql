-- Revert: schemas/myapp_events_public/tables/org_level_requirements/columns/description/column


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP COLUMN description RESTRICT;


