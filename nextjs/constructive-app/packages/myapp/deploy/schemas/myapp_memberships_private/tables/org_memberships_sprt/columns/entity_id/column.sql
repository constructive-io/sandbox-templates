-- Deploy: schemas/myapp_memberships_private/tables/org_memberships_sprt/columns/entity_id/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/table


ALTER TABLE myapp_memberships_private.org_memberships_sprt 
  ADD COLUMN entity_id uuid;

