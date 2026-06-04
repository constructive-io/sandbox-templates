-- Revert: schemas/myapp_memberships_public/tables/org_members/columns/entity_id/alterations/alt0000000719


ALTER TABLE myapp_memberships_public.org_members 
  ALTER COLUMN entity_id DROP NOT NULL;


