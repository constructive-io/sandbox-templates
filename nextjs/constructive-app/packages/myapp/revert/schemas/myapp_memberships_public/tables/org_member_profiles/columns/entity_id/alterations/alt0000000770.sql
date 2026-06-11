-- Revert: schemas/myapp_memberships_public/tables/org_member_profiles/columns/entity_id/alterations/alt0000000770


ALTER TABLE myapp_memberships_public.org_member_profiles 
  ALTER COLUMN entity_id DROP NOT NULL;


