-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/columns/id/alterations/alt0000000531
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/columns/id/column


ALTER TABLE myapp_limits_public.org_limit_credits 
  ALTER COLUMN id SET NOT NULL;

