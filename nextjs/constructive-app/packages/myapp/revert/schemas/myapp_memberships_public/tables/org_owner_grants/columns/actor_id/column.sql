-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/actor_id/column


ALTER TABLE myapp_memberships_public.org_owner_grants 
  DROP COLUMN actor_id RESTRICT;


