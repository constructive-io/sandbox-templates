-- Revert: schemas/myapp_limits_public/tables/org_limit_caps_defaults/columns/id/column


ALTER TABLE myapp_limits_public.org_limit_caps_defaults 
  DROP COLUMN id RESTRICT;


