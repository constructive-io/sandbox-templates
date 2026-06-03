-- Deploy: schemas/myapp_limits_private/tables/org_limit_warning_state/alterations/alt0000000601
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_private/schema
-- requires: schemas/myapp_limits_private/tables/org_limit_warning_state/table


ALTER TABLE myapp_limits_private.org_limit_warning_state 
  DISABLE ROW LEVEL SECURITY;

