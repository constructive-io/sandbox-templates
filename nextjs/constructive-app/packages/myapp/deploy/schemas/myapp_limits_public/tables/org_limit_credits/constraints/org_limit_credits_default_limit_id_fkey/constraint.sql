-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/constraints/org_limit_credits_default_limit_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table


ALTER TABLE myapp_limits_public.org_limit_credits 
  ADD CONSTRAINT org_limit_credits_default_limit_id_fkey 
    FOREIGN KEY(default_limit_id) 
    REFERENCES myapp_limits_public.org_limit_defaults (id) 
    ON DELETE RESTRICT;

