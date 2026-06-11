-- Deploy: schemas/myapp_memberships_public/tables/app_memberships/alterations/alt0000000182
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/app_memberships/table


COMMENT ON TABLE myapp_memberships_public.app_memberships IS E'Tracks membership records linking actors to entities with permission bitmasks, ownership, and admin status';

