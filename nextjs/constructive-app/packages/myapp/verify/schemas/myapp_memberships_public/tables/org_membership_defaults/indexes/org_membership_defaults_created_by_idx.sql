-- Verify: schemas/myapp_memberships_public/tables/org_membership_defaults/indexes/org_membership_defaults_created_by_idx


SELECT verify_index('myapp_memberships_public.org_membership_defaults', 'org_membership_defaults_created_by_idx');


