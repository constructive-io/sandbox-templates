-- Deploy: schemas/myapp_memberships_public/tables/membership_types/columns/id/alterations/alt0000000016
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/table
-- requires: schemas/myapp_memberships_public/tables/membership_types/columns/id/column


ALTER TABLE myapp_memberships_public.membership_types 
  ALTER COLUMN id SET NOT NULL;

