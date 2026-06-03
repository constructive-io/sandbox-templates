-- Revert: schemas/myapp_events_public/tables/app_level_grants/constraints/app_level_grants_pkey/constraint


ALTER TABLE myapp_events_public.app_level_grants 
  DROP CONSTRAINT app_level_grants_pkey;


