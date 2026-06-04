-- Revert: schemas/myapp_memberships_public/tables/org_admin_grants/columns/actor_id/alterations/alt0000000728


ALTER TABLE myapp_memberships_public.org_admin_grants 
  ALTER COLUMN actor_id DROP NOT NULL;


