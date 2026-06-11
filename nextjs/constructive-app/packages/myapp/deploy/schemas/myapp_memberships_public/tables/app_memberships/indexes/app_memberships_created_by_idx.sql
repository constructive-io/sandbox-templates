-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/indexes/app_memberships_created_by_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table
-- requires: schemas/myapp_memberships_public/tables/app_memberships/columns/created_by/column


CREATE INDEX app_memberships_created_by_idx ON myapp_memberships_public.app_memberships ( created_by );

