-- Verify: schemas/myapp_memberships_public/tables/org_members/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.org_members', 'select', 'authenticated');


