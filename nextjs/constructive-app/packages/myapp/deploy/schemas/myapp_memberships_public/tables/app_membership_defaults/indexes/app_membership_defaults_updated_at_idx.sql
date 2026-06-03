-- Deploy: schemas/myapp_memberships_public/tables/app_membership_defaults/indexes/app_membership_defaults_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/table
-- requires: schemas/myapp_memberships_public/tables/app_membership_defaults/columns/updated_at/column


CREATE INDEX app_membership_defaults_updated_at_idx ON myapp_memberships_public.app_membership_defaults ( updated_at );

