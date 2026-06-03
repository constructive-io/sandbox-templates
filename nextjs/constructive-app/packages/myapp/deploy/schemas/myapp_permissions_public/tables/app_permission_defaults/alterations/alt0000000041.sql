-- Deploy: schemas/myapp_permissions_public/tables/app_permission_defaults/alterations/alt0000000041
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permission_defaults/table


COMMENT ON TABLE myapp_permissions_public.app_permission_defaults IS 'Stores the default permission bitmask assigned to new members upon joining';

