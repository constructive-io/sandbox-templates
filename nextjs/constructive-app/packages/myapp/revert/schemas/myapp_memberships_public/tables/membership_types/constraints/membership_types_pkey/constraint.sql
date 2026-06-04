-- Revert: schemas/myapp_memberships_public/tables/membership_types/constraints/membership_types_pkey/constraint


ALTER TABLE myapp_memberships_public.membership_types 
  DROP CONSTRAINT membership_types_pkey;


