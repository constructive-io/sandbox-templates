-- Deploy: schemas/myapp_memberships_public/tables/membership_types/grants/authenticated/select/grant
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/table


GRANT SELECT ON myapp_memberships_public.membership_types TO authenticated;

