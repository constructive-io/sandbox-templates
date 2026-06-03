-- Deploy: schemas/myapp_memberships_public/tables/app_membership_defaults/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/table


GRANT SELECT ON myapp_memberships_public.app_membership_defaults TO authenticated;

