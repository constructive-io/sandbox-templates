-- Verify: schemas/myapp_memberships_public/tables/org_membership_defaults/grants/authenticated/insert/grant


SELECT verify_table_grant('myapp_memberships_public.org_membership_defaults', 'insert', 'authenticated');


