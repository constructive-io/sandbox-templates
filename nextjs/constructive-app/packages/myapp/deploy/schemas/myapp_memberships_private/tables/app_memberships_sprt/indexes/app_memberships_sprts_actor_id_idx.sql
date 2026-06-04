-- Deploy: schemas/myapp_memberships_private/tables/app_memberships_sprt/indexes/app_memberships_sprts_actor_id_idx
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_private/schema
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/table
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/actor_id/column
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/is_admin/column
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/is_owner/column
-- requires: schemas/myapp_memberships_private/tables/app_memberships_sprt/columns/permissions/column


CREATE UNIQUE INDEX app_memberships_sprts_actor_id_idx ON myapp_memberships_private.app_memberships_sprt USING BTREE ( actor_id ) INCLUDE ( permissions, is_owner, is_admin );

