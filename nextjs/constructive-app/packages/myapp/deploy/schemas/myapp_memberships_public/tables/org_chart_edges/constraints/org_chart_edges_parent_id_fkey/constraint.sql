-- Deploy: schemas/myapp_memberships_public/tables/org_chart_edges/constraints/org_chart_edges_parent_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/myapp_users_public/schema
-- requires: schemas/myapp_memberships_public/schema
-- requires: schemas/myapp_users_public/tables/users/table
-- requires: schemas/myapp_memberships_public/tables/org_chart_edges/table


ALTER TABLE myapp_memberships_public.org_chart_edges 
  ADD CONSTRAINT org_chart_edges_parent_id_fkey 
    FOREIGN KEY(parent_id) 
    REFERENCES myapp_users_public.users (id) 
    ON DELETE SET NULL;

