-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/columns/entity_id/alterations/alt0000000154
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/columns/entity_id/column


ALTER TABLE myapp_limits_public.app_limit_caps 
  ALTER COLUMN entity_id SET NOT NULL;

