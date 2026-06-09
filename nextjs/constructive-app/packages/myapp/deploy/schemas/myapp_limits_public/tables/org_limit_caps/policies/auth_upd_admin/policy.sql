-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps/policies/auth_upd_admin/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/table
-- requires: schemas/myapp_limits_public/tables/org_limit_caps/policies/enable_row_level_security


CREATE POLICY auth_upd_admin ON myapp_limits_public.org_limit_caps
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.is_admin IS TRUE OR app_sprt.is_owner IS TRUE))
);

