-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_grants/constraints/app_permission_default_grants_grantor_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/table


ALTER TABLE myapp_memberships_public.app_permission_default_grants 
  ADD CONSTRAINT app_permission_default_grants_grantor_id_fkey 
    FOREIGN KEY(grantor_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

