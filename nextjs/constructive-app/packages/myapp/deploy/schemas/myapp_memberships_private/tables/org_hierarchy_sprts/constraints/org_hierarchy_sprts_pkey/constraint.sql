-- Deploy: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/constraints/org_hierarchy_sprts_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_hierarchy_sprts/table


ALTER TABLE myapp_memberships_private.org_hierarchy_sprts 
  ADD CONSTRAINT org_hierarchy_sprts_pkey PRIMARY KEY (entity_id, ancestor_id, descendant_id);

