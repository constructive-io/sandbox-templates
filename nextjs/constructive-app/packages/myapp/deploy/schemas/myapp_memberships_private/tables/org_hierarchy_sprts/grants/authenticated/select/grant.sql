-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table


GRANT SELECT ON myapp_memberships_private.org_hierarchy_sprts TO authenticated;

