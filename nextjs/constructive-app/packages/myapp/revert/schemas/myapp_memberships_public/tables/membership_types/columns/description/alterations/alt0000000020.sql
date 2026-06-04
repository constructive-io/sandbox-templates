-- Revert: schemas/myapp_memberships_public/tables/membership_types/columns/description/alterations/alt0000000020


ALTER TABLE myapp_memberships_public.membership_types 
  ALTER COLUMN description DROP NOT NULL;


