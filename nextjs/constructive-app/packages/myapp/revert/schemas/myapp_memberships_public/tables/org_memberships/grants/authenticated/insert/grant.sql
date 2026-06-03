-- Revert: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/insert/grant


REVOKE INSERT (actor_id, entity_id) ON myapp_memberships_public.org_memberships FROM authenticated;


