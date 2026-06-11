-- Deploy: schemas/myapp_limits_private/tables/app_limit_warning_state/alterations/alt0000000171
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/app_limit_warning_state/table


ALTER TABLE myapp_limits_private.app_limit_warning_state 
  DISABLE ROW LEVEL SECURITY;

