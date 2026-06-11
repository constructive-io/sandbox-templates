-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/scope/alterations/alt0000000022


ALTER TABLE myapp_memberships_public.membership_types 
  ALTER COLUMN scope DROP NOT NULL;


