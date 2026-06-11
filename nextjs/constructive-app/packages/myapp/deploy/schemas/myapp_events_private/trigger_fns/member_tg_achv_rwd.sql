-- Deploy: schemas/myapp_events_private/trigger_fns/member_tg_achv_rwd
-- made with <3 @ constructive.io

-- requires: schemas/myapp_limits_public/schema
-- requires: schemas/myapp_events_private/schema
-- requires: schemas/myapp_limits_public/tables/org_limit_credits/table
-- requires: schemas/myapp_limits_public/tables/org_limit_defaults/table
-- requires: schemas/myapp_events_public/tables/org_achievement_rewards/table


CREATE FUNCTION myapp_events_private.member_tg_achv_rwd() RETURNS TRIGGER AS $_PGFN_$
DECLARE
  v_reward record;
  v_default_limit_id uuid;
BEGIN
  FOR v_reward IN SELECT
    ar.reward_type AS reward_type,
    ar.target_name AS target_name,
    ar.amount AS amount,
    ar.credit_type AS credit_type,
    ar.expires_interval AS expires_interval
  FROM myapp_events_public.org_achievement_rewards AS ar
  WHERE
    ar.level_name = NEW.level_name AND ar.entity_id = NEW.entity_id LOOP
    IF v_reward.reward_type = 'limit_credit' THEN
      SELECT id
      FROM myapp_limits_public.org_limit_defaults
      WHERE
        name = v_reward.target_name INTO v_default_limit_id;
      IF v_default_limit_id IS NOT NULL THEN
        INSERT INTO myapp_limits_public.org_limit_credits (
          default_limit_id,
          actor_id,
          entity_id,
          amount,
          credit_type,
          reason
        )
        VALUES
          (v_default_limit_id, NEW.actor_id, NEW.entity_id, v_reward.amount, v_reward.credit_type, 'achievement:' || NEW.level_name);
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$_PGFN_$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

