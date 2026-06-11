-- Deploy: schemas/myapp_limits_public/tables/app_limit_events/table
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema


CREATE TABLE myapp_limits_public.app_limit_events (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

