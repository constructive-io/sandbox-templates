-- Verify: schemas/myapp_memberships_private/tables/org_memberships_sprt/grants/public/select/grant


SELECT verify_table_grant('myapp_memberships_private.org_memberships_sprt', 'select', 'public');


