-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/columns/bitstr/alterations/alt0000000488
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table
-- requires: schemas/myapp_permissions_public/tables/org_permissions/columns/bitstr/column


ALTER TABLE myapp_permissions_public.org_permissions 
  ALTER COLUMN bitstr SET DEFAULT (lpad('', 64, '0'))::bit(64);

