-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/actor_id/column


ALTER TABLE myapp_memberships_public.org_member_profiles 
  DROP COLUMN actor_id RESTRICT;


