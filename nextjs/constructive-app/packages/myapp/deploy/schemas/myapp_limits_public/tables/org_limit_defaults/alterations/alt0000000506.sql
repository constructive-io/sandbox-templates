-- Deploy: schemas/myapp_limits_public/tables/org_limit_defaults/alterations/alt0000000506
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


ALTER TABLE myapp_limits_public.org_limit_defaults 
  DISABLE ROW LEVEL SECURITY;

