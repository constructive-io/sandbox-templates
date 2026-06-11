-- Deploy: schemas/myapp_memberships_private/procedures/org_memberships_perm_check/procedure
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_permissions_public/tables/org_permissions/table


CREATE FUNCTION myapp_memberships_private.org_memberships_perm_check(
  perm text,
  entity_id uuid,
  actor_id uuid DEFAULT jwt_public.current_user_id()
) RETURNS boolean AS $_PGFN_$
SELECT
  EXISTS (SELECT 1
  FROM myapp_memberships_public.org_memberships AS m, myapp_permissions_public.org_permissions AS p
  WHERE
    ((p.name = perm AND (m.permissions & p.bitstr) = p.bitstr) AND m.entity_id = org_memberships_perm_check.entity_id) AND m.actor_id = org_memberships_perm_check.actor_id)
$_PGFN_$ LANGUAGE sql STABLE SECURITY DEFINER;

