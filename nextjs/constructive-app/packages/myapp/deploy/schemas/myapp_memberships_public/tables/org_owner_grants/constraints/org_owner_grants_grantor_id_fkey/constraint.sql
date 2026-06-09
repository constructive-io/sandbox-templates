-- Deploy: schemas/myapp_memberships_public/tables/org_owner_grants/constraints/org_owner_grants_grantor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/org_owner_grants/table


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ADD CONSTRAINT org_owner_grants_grantor_id_fkey 
    FOREIGN KEY(grantor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

