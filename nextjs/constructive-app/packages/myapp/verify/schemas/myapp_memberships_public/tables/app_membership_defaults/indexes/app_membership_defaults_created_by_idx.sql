-- Verify: schemas/myapp_memberships_public/tables/app_membership_defaults/indexes/app_membership_defaults_created_by_idx


SELECT verify_index('myapp_memberships_public.app_membership_defaults', 'app_membership_defaults_created_by_idx');


