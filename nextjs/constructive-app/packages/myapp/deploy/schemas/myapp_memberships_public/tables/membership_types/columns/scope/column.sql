-- Deploy: schemas/myapp_memberships_public/tables/membership_types/columns/scope/column
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/table


ALTER TABLE myapp_memberships_public.membership_types 
  ADD COLUMN scope text;

