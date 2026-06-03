-- Deploy: schemas/myapp_memberships_public/tables/org_membership_settings/constraints/org_membership_settings_entity_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/org_membership_settings/table


ALTER TABLE myapp_memberships_public.org_membership_settings 
  ADD CONSTRAINT org_membership_settings_entity_id_fkey 
    FOREIGN KEY(entity_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE CASCADE;

