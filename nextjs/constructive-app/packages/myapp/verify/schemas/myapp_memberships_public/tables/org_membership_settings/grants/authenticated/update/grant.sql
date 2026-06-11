-- Verify: schemas/myapp_memberships_public/tables/org_membership_settings/grants/authenticated/update/grant


SELECT verify_table_grant('myapp_memberships_public.org_membership_settings', 'update', 'authenticated');


