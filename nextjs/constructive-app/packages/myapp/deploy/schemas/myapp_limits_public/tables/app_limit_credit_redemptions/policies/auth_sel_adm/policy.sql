-- Deploy: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/policies/auth_sel_adm/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_credit_redemptions/table


CREATE POLICY auth_sel_adm ON myapp_limits_public.app_limit_credit_redemptions
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1
  FROM myapp_memberships_private.app_memberships_sprt AS app_sprt
  WHERE
      app_sprt.actor_id = jwt_public.current_user_id() AND (app_sprt.permissions & '0000000000000000000000000000000000000000000000000000001000000000') = '0000000000000000000000000000000000000000000000000000001000000000')
);

