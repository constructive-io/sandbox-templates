-- Deploy: schemas/myapp_memberships_public/tables/app_permission_default_grants/alterations/alt0000000287
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_permission_default_grants/table


COMMENT ON TABLE myapp_memberships_public.app_permission_default_grants IS 'Audit log of permission additions and removals from the defaults bitmask';

