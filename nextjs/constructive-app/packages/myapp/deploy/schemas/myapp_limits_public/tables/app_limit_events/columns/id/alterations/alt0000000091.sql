-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/columns/id/alterations/alt0000000091
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_events/table
-- requires: schemas/myapp_limits_public/tables/app_limit_events/columns/id/column


ALTER TABLE myapp_limits_public.app_limit_events 
  ALTER COLUMN id SET NOT NULL;

