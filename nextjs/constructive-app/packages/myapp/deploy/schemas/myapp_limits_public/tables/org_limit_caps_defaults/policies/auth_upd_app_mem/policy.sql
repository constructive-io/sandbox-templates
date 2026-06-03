-- Deploy: schemas/myapp_limits_public/tables/org_limit_caps_defaults/policies/auth_upd_app_mem/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_caps_defaults/table


CREATE POLICY auth_upd_app_mem ON myapp_limits_public.org_limit_caps_defaults
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000000000100000') = '0000000000000000000000000000000000000000000000000000000000100000')
);

