-- Revert: schemas/myapp_events_public/tables/org_level_requirements/constraints/org_level_requirements_pkey/constraint


ALTER TABLE myapp_events_public.org_level_requirements 
  DROP CONSTRAINT org_level_requirements_pkey;


