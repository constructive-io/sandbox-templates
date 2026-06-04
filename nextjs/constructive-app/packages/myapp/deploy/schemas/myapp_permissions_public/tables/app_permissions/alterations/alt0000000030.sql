-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/alterations/alt0000000030
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table


COMMENT ON TABLE myapp_permissions_public.app_permissions IS E'Defines available permissions as named bits within a bitmask, used by the RBAC system for access control';

