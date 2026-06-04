-- Deploy: schemas/myapp_memberships_public/tables/org_grants/constraints/org_grants_grantor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/org_grants/table


ALTER TABLE myapp_memberships_public.org_grants 
  ADD CONSTRAINT org_grants_grantor_id_fkey 
    FOREIGN KEY(grantor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

