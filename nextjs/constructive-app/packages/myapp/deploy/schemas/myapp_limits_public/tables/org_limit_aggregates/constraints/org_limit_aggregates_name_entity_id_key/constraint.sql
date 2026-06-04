-- Deploy: schemas/myapp_limits_public/tables/org_limit_aggregates/constraints/org_limit_aggregates_name_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_aggregates/table


ALTER TABLE myapp_limits_public.org_limit_aggregates 
  ADD CONSTRAINT org_limit_aggregates_name_entity_id_key 
    UNIQUE (name, entity_id);

