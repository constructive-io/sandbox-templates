-- Deploy: schemas/myapp_limits_public/tables/org_limits/columns/actor_id/alterations/alt0000000490
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limits/table
-- requires: schemas/myapp_limits_public/tables/org_limits/columns/actor_id/column


ALTER TABLE myapp_limits_public.org_limits 
  ALTER COLUMN actor_id SET NOT NULL;

