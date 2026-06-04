-- Deploy: schemas/myapp_memberships_public/tables/app_grants/alterations/alt0000000267
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_grants/table


COMMENT ON TABLE myapp_memberships_public.app_grants IS 'Records of individual permission grants and revocations for members via bitmask';

