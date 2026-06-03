-- Deploy: schemas/myapp_limits_public/tables/org_limit_credits/policies/auth_sel_own/policy
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table


CREATE POLICY auth_sel_own ON myapp_limits_public.org_limit_credits
FOR SELECT
TO authenticated
USING (
  actor_id = jwt_public.current_user_id()
);

