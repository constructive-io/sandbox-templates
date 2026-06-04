-- Deploy: schemas/myapp_limits_public/tables/app_limit_caps/constraints/app_limit_caps_name_entity_id_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_limits_public/tables/app_limit_caps/table


ALTER TABLE myapp_limits_public.app_limit_caps 
  ADD CONSTRAINT app_limit_caps_name_entity_id_key 
    UNIQUE (name, entity_id);

