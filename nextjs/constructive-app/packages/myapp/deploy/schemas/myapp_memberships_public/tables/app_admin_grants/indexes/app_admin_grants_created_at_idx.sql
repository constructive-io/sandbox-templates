-- Deploy: schemas/myapp_memberships_public/tables/app_admin_grants/indexes/app_admin_grants_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_admin_grants/table
-- requires: schemas/myapp_memberships_public/tables/app_admin_grants/columns/created_at/column


CREATE INDEX app_admin_grants_created_at_idx ON myapp_memberships_public.app_admin_grants ( created_at );

