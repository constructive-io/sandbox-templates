-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/columns/id/alterations/alt0000000595
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/table
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/columns/id/column


ALTER TABLE myapp_limits_public.org_limit_caps 
  ALTER COLUMN id SET DEFAULT uuidv7();

