-- Deploy: schemas/myapp_memberships_private/tables/org_memberships_sprt/alterations/alt0000000625
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/org_memberships_sprt/table


COMMENT ON TABLE myapp_memberships_private.org_memberships_sprt IS E'Security Predicate Resolution Table (SPRT). Denormalized lookup table used by RLS policies for fast permission checks without recursive queries';

