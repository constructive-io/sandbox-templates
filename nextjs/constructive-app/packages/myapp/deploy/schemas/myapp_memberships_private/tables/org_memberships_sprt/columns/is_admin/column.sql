-- Deploy: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/is_admin/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/table


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ADD COLUMN is_admin boolean;

