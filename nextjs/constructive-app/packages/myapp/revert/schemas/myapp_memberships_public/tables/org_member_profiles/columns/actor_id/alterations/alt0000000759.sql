-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/actor_id/alterations/alt0000000759


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN actor_id DROP NOT NULL;


