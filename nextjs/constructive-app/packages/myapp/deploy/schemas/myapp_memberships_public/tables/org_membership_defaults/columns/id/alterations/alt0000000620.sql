-- Deploy: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/id/alterations/alt0000000620
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_membership_defaults/table
-- requires: schemas/myapp_memberships_public/tables/org_membership_defaults/columns/id/column


ALTER TABLE myapp_memberships_public.org_membership_defaults 
  ALTER COLUMN id SET NOT NULL;

