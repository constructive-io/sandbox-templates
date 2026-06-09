-- Revert: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/max/alterations/alt0000000589


ALTER TABLE myapp_limits_public.org_limit_caps_defaults 
  ALTER COLUMN max DROP NOT NULL;


