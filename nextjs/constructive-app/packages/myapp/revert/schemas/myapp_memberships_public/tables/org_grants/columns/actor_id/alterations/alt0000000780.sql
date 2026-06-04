-- Revert: schemas/myapp_memberships_public/tables/org_grants/columns/actor_id/alterations/alt0000000780


ALTER TABLE myapp_memberships_public.org_grants 
  ALTER COLUMN actor_id DROP NOT NULL;


