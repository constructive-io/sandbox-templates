-- Deploy: schemas/myapp_memberships_public/tables/membership_types/columns/scope/alterations/alt0000000023
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/membership_types/columns/scope/column


COMMENT ON COLUMN myapp_memberships_public.membership_types.scope IS E'Scope identifier for this membership type, used to resolve scope on module config tables';

