-- Deploy: schemas/myapp_permissions_public/tables/app_permissions/columns/bitnum/alterations/alt0000000034
-- made with <3 @ constructive.io

-- requires: schemas/myapp_permissions_public/schema
-- requires: schemas/myapp_permissions_public/tables/app_permissions/table
-- requires: schemas/myapp_permissions_public/tables/app_permissions/columns/bitnum/column


ALTER TABLE myapp_permissions_public.app_permissions 
  ADD CONSTRAINT app_permissions_bitnum_chk 
    CHECK (bitnum >= 1 AND bitnum <= 64);

