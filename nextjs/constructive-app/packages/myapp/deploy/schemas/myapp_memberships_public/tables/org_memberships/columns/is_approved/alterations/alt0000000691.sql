-- Deploy: schemas/myapp_memberships_public/tables/org_memberships/columns/is_approved/alterations/alt0000000691
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_memberships/table
-- requires: schemas/myapp_memberships_public/tables/org_memberships/columns/is_approved/column


ALTER TABLE myapp_memberships_public.org_memberships 
  ALTER COLUMN is_approved SET NOT NULL;

