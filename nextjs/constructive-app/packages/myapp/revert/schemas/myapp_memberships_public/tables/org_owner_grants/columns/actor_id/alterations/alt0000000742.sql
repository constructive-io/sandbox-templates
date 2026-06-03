-- Revert: schemas/myapp_memberships_public/tables/org_owner_grants/columns/actor_id/alterations/alt0000000742


ALTER TABLE myapp_memberships_public.org_owner_grants 
  ALTER COLUMN actor_id DROP NOT NULL;


