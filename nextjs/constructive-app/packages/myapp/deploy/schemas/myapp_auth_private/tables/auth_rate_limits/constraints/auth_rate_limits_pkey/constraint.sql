-- Deploy: schemas/myapp_auth_private/tables/auth_rate_limits/constraints/auth_rate_limits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_auth_private/schema
-- requires: schemas/myapp_auth_private/tables/auth_rate_limits/table


ALTER TABLE myapp_auth_private.auth_rate_limits 
  ADD CONSTRAINT auth_rate_limits_pkey PRIMARY KEY (id);

