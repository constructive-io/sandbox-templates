-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/constraints/org_chart_edges_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ADD CONSTRAINT org_chart_edges_pkey PRIMARY KEY (id);

