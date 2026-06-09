-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_permissions/indexes/app_permission_default_permissions_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/table
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_permissions/columns/updated_at/column


CREATE INDEX app_permission_default_permissions_updated_at_idx ON myapp_memberships_public.app_permission_default_permissions ( updated_at );

