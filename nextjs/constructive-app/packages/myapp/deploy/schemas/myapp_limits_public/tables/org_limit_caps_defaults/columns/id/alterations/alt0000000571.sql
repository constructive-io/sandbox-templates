-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/id/alterations/alt0000000571
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/id/column


ALTER TABLE myapp_limits_public.org_limit_caps_defaults 
  ALTER COLUMN id SET DEFAULT uuidv7();

