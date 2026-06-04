-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/actor_id/alterations/alt0000000053
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/actor_id/column


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN actor_id SET NOT NULL;

