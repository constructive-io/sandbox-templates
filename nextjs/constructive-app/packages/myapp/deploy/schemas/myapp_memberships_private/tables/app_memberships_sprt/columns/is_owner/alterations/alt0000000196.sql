-- Deploy: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/is_owner/alterations/alt0000000196
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/table
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/is_owner/column


ALTER TABLE myapp_memberships_private.app_memberships_sprt 
  ALTER COLUMN is_owner SET DEFAULT false;

