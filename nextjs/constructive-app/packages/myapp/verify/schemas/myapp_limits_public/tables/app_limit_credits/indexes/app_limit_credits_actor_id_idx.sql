-- Verify: schemas/myapp_limits_public/tables/app_limit_credits/indexes/app_limit_credits_actor_id_idx


SELECT verify_index('myapp_limits_public.app_limit_credits', 'app_limit_credits_actor_id_idx');


