-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/alterations/alt0000000481
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


COMMENT ON TABLE myapp_permissions_public.org_permissions IS E'Defines available permissions as named bits within a bitmask, used by the RBAC system for access control';

