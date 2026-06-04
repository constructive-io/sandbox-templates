-- Deploy: schemas/myapp_limits_public/tables/app_limits/columns/id/alterations/alt0000000051
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limits/table
-- requires: schemas/myapp_limits_public/tables/app_limits/columns/id/column


ALTER TABLE myapp_limits_public.app_limits 
  ALTER COLUMN id SET DEFAULT uuidv7();

