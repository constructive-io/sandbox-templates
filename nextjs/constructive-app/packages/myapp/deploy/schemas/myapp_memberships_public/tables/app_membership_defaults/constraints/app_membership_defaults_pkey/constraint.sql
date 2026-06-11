-- Deploy: schemas/myapp_memberships_public/tables/app_membership_defaults/constraints/app_membership_defaults_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/table


ALTER TABLE myapp_memberships_public.app_membership_defaults 
  ADD CONSTRAINT app_membership_defaults_pkey PRIMARY KEY (id);

