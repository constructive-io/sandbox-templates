-- Deploy: schemas/myapp_infra_public/tables/app_namespace_events/table
-- made with <3 @ constructive.io

-- requires: schemas/myapp_infra_public/schema


CREATE TABLE myapp_infra_public.app_namespace_events (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

