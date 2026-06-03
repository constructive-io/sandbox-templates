-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/parent_membership_type/column


ALTER TABLE myapp_memberships_public.membership_types 
  DROP COLUMN parent_membership_type RESTRICT;


