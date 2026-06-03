-- Deploy: schemas/myapp_memberships_public/tables/membership_types/columns/description/alterations/alt0000000021
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/columns/description/column


COMMENT ON COLUMN myapp_memberships_public.membership_types.description IS 'Description of what this membership type represents';

