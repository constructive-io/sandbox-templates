-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/constraints/org_limit_credits_entity_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table


ALTER TABLE myapp_limits_public.org_limit_credits 
  ADD CONSTRAINT org_limit_credits_entity_id_fkey 
    FOREIGN KEY(entity_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

