-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_permissions/constraints/app_permission_default_permissions_permission_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table


ALTER TABLE myapp_memberships_public.app_permission_default_permissions 
  ADD CONSTRAINT app_permission_default_permissions_permission_id_fkey 
    FOREIGN KEY(permission_id) 
    REFERENCES myapp_permissions_public.app_permissions (id) 
    ON DELETE CASCADE;

