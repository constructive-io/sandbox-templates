-- Revert: schemas/myapp_memberships_public/tables/org_membership_settings/columns/entity_id/alterations/alt0000000653


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ALTER COLUMN entity_id DROP NOT NULL;


