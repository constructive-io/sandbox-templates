-- Verify: schemas/myapp_memberships_public/tables/membership_types/grants/authenticated/select/grant


SELECT verify_table_grant('myapp_memberships_public.membership_types', 'select', 'authenticated');


