-- Verify: schemas/myapp_memberships_public/tables/org_memberships/grants/authenticated/delete/grant


SELECT verify_table_grant('myapp_memberships_public.org_memberships', 'delete', 'authenticated');


