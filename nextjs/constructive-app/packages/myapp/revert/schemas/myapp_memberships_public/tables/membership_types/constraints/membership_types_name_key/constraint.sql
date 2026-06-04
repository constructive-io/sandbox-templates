-- Revert: schemas/myapp_memberships_public/tables/membership_types/constraints/membership_types_name_key/constraint


ALTER TABLE myapp_memberships_public.membership_types 
  DROP CONSTRAINT membership_types_name_key;


