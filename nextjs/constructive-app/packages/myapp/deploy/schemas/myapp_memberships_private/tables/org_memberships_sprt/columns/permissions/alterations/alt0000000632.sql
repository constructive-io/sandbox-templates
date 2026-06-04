-- Deploy: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/permissions/alterations/alt0000000632
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/table
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/permissions/column


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ALTER COLUMN permissions SET NOT NULL;

