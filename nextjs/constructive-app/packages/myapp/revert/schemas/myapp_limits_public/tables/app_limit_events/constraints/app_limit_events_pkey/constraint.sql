-- Revert: schemas/myapp_limits_public/tables/app_limit_events/constraints/app_limit_events_pkey/constraint


ALTER TABLE myapp_limits_public.app_limit_events 
  DROP CONSTRAINT app_limit_events_pkey;


