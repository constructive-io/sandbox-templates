-- Deploy: schemas/myapp_permissions_public/tables/org_permissions/columns/bitnum/alterations/alt0000000485
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table
-- requires: schemas/myapp_permissions_public/tables/org_permissions/columns/bitnum/column


ALTER TABLE myapp_permissions_public.org_permissions 
  ADD CONSTRAINT org_permissions_bitnum_chk 
    CHECK (bitnum >= 1 AND bitnum <= 64);

