-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/actor_id/alterations/alt0000000732


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN actor_id DROP NOT NULL;


