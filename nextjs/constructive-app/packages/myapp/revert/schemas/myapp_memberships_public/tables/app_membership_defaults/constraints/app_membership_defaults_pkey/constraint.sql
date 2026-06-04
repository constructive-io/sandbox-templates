-- Revert: schemas/myapp_memberships_public/tables/app_membership_defaults/constraints/app_membership_defaults_pkey/constraint


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  DROP CONSTRAINT app_membership_defaults_pkey;


