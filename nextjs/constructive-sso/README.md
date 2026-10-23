# constructive-sso

Next.js boilerplate exercising Constructive's **cloud-function SSO** end-to-end.
Sign-in is served by the platform's shared **mantra** page set (login, sign-up,
recovery, MFA, OAuth return leg) plus the tenant's **auth GraphQL**, which the
app's server routes call directly (session probe, sign-in/out, SMS OTP,
step-up). The app itself is just the product — it does **not** register or fork
any of the auth functions.

> **Architecture:** `fun up --alt-ports` (KIND mode) brings up ONE platform
> database — `constructive-functions-db1` (in the local kind cluster,
> port-forwarded to `:15432`). The tenant is a logical database inside that
> platform, provisioned with the `b2b:storage` preset. There is no second
> database and no `cnc` GraphQL server — do **not** run the old
> `docker-compose` / `cnc server` flow, it is a different, conflicting
> platform.

## How consumption works (no per-tenant registrations)

`functions/sso`, `functions/auth` and the `mantra` image are registered **once
at platform scope** by `fun up`. A tenant serves them by writing ordinary
rows into the shared, database-scoped routing plane (`routing_public.routes` /
`sites`) keyed by its own `database_id`. A tenant route may target any function
definition on its own **frame chain** (its own scopes, then each ancestor up to
the platform), and the install verbs resolve that shared plane along the
caller's frames — so a tenant installs mantra's page set and its sync lanes
without registering a single definition of its own. `packages/provision/
ensure-site.ts` is exactly this: a short sequence of platform verbs.

## Prerequisites

- Docker Desktop (the bring-up creates its own kind cluster — KIND mode)
- Node + `pnpm`, `psql`, `kubectl`, `kind`, `helm` on PATH
- A sibling `constructive-db` checkout (the platform + the cloud functions)
- `.env` filled with provider credentials (see [SSO Testing](#sso-testing))

## Full setup

Two parts:

- **Part A — the platform.** Manual. The script does not do this.
- **Part B — the tenant + app.** `pnpm run local:bringup` runs **all of Part
  B automatically** (it ends by starting Next.js in the foreground). The
  manual steps below are the same sequence, spelled out.

| # | Step | Part | `local:bringup` covers it? |
|---|---|---|---|
| 0 | Full teardown (optional) | A | no — manual |
| 1 | `fun up --alt-ports` | A | no — prerequisite |
| 2 | `create-db`: the owner + the tenant | B | **yes** |
| 3 | `ensure-site`: site, mantra + sso presets, root `/` → app | B | **yes** |
| 4 | `configure-email` / `-sms` / `-sso` / `-auth` / `-orgs` | B | **yes** |
| 5 | Regenerate the GraphQL SDK (`pnpm codegen`) | B | **yes** |
| 6 | Start the app (`pnpm dev`) | B | **yes** — script's last step |

So the short path is: do Part A, put `OWNER_EMAIL`/`OWNER_PASSWORD` (and the
`OAUTH_*`, `TWILIO_*` values) in `.env`, then one command:

```bash
pnpm run local:bringup
```

### Part A — Platform (manual)

#### 0. (Optional) Full teardown first

Skip this on a clean machine. Run it when you want a genuinely fresh start
(stale cluster state, subnet shift after a reboot, preset experiments):

```bash
cd constructive-db
fun down                            # removes app namespaces + postgres PVC + fun state (~2-3 min, let it finish)
kind delete cluster --name constructive
kind get clusters                   # → "No kind clusters found."
```

`fun down` keeps Knative/Traefik/Cilium on purpose; the `kind delete`
removes them with the cluster — that is what a true fresh start wants.

#### 1. Bring up the platform (one database)

```bash
cd constructive-db/compute
fun up --alt-ports
```

This builds the functions image, creates the kind cluster (Cilium-enforced),
deploys the platform DB (`constructive-functions-db1`), registers the shared
function definitions + deployments, and starts the compute-sync gateway.
~10–30 min the first time; idempotent after. Ends with
`K8s environment is up`.

Then re-establish the DB port-forward (fun's own forwards die with its
daemon — re-run this in any new terminal session):

```bash
nohup kubectl port-forward -n constructive-infra svc/postgres 15432:5432 >/tmp/pf.log 2>&1 &
psql -h localhost -p 15432 -U postgres -d constructive-functions-db1 -c "select 'pg-ok'"
```

**Then the DNS guard** (skip only if already applied — idempotent). Docker
Desktop's built-in DNS proxy silently stops answering after host sleep/restarts;
CoreDNS forwards there by default, so pods then fail EXTERNAL name resolution
and the OAuth token exchange dies with `SSO_PROVIDER_TOKEN_EXCHANGE_FAILED`.
Re-point the forward at public DNS:

```bash
if kubectl get configmap coredns -n kube-system -o jsonpath='{.data.Corefile}' | grep -q 'forward . /etc/resolv.conf'; then
  python3 - <<'PY'
import json, subprocess
cm = json.loads(subprocess.run(['kubectl','get','configmap','coredns','-n','kube-system','-o','json'], capture_output=True, text=True).stdout)
corefile = cm['data']['Corefile'].replace('forward . /etc/resolv.conf {', 'forward . 8.8.8.8 1.1.1.1 {')
subprocess.run(['kubectl','patch','configmap','coredns','-n','kube-system','--type','merge','-p', json.dumps({'data':{'Corefile':corefile}})], capture_output=True)
PY
  kubectl rollout restart deploy/coredns -n kube-system
  echo "CoreDNS re-pointed to public DNS"
fi
```

Verify pod egress (expect `EGRESS OK`, HTTP 400 is Google's correct reply to an
empty token POST):

```bash
kubectl exec deploy/compute-sync -n constructive-platform-default -- node -e \
  "fetch('https://oauth2.googleapis.com/token',{method:'POST'}).then(r=>console.log('EGRESS OK',r.status)).catch(e=>console.log('EGRESS FAIL',e.cause?.code||e.message))"
```

### Part B — Tenant setup (exactly what `pnpm run local:bringup` runs)

#### Who provisioning acts as

Every step acts as the tenant's **owner**: a real platform user, signed in with
`OWNER_EMAIL` / `OWNER_PASSWORD` from `.env` (use an account without 2FA —
provisioning signs in with the password). A database is its own identity
realm, so the owner holds two sessions:

- the **platform** session (`auth.localhost`), for the tenant's rows in the
  platform's shared planes: the database request, the site and its routes,
  the email sender;
- the **tenant** session (the tenant's own `auth-<slug>` host, issued once the
  reconciler has bootstrapped the owner into the tenant), for the tenant's own
  rows: provider, auth policy, config/secrets, membership defaults.

A write goes through the realm's GraphQL where the operation is exposed
(`requestDatabase`, the tenant's config and admin APIs). Where it is not, it
runs in SQL inside one transaction whose claims are what the realm's own
`authenticate()` answers for the session token — so RLS triggers and the 2FA
step-up guards see the same owner and session a request would
(`packages/provision/src/realm.ts`). Nothing runs as `platform-bootstrap`, and
nothing writes with empty claims.

#### 2. The owner and the tenant

```bash
cd sandbox-templates/nextjs/constructive-sso
pnpm install        # once, after cloning or pulling (local:bringup does this if missing)
pnpm run create-db
```

- **First run: the owner is set up through the mailbox.** Password sign-up
  signs nobody in, and the password stays pending until the address is proven
  (planning#2291). So `create-db` signs the owner up, opens the verification
  mail from Mailpit, and signs in. If the address is proven but holds no
  password (a second sign-up "contests" a pending one), it recovers through
  forgot/reset password, again from the mailbox.
- **Operator step: the `databases` allowance.** The platform has no free tier,
  so an owner with no subscription may not create a database. Locally there is
  no plan to buy, so the owner gets the explicit unlimited row the platform's
  own owners hold — the same row as upstream's fixture helper
  `grantDatabaseAllowance`.
- `requestDatabase` on the platform's api lane, as the owner (the
  `b2b:storage` warm pool claims instantly). The reconciler's
  `db_pool:bootstrap_owner` job then copies the owner into the tenant;
  `create-db` waits for the ticket's recorded `bootstrap_status`.
- The tenant's hosts are named from its slug (`*-a88-creepy-white-amphibian.localhost`),
  so `DATABASE_ID`, `NEXT_PUBLIC_DB_NAME` and the `GRAPHQL_*_URL`s are written
  into `.env`.

Idempotent: re-running reuses the tenant.

#### 3. The tenant's site

```bash
pnpm run ensure-site
```

As the owner's platform session, attributed to the tenant:

- the site on `SSO_ROUTE_HOST` (`sites_provision_static_site`, which also
  claims the `localhost` domains row);
- **LOCAL WORKAROUND — the loopback host's verification.** `resolve_route`
  serves only verified hostnames, and no ownership challenge can prove a bare
  `localhost` (inside the cluster it is the reconciler's own pod). The
  platform's own local host, `<label>.sites.localhost`, arrives verified — but
  Google refuses redirect URIs on `.localhost` subdomains, and the app and the
  gateway must share one cookie host. So the owner marks the `localhost` row
  verified; any other host is refused;
- `canonical_url = APP_ORIGIN` in the site metadata (the OAuth callback and the
  hosted session's step-up origin are both built from it);
- the `mantra` page set and the `sso` preset (`/auth/start`, `/auth/callback`),
  plus the one sync lane, `/auth/link` (`sso:link`, account linking);
- a redirect route that turns the mantra pages' `/` landing into a hop to the
  app (`http://localhost:3000/`);
- a `resolve_route` walk: every bound path must resolve.

The platform's route reconciler publishes a Traefik route for each path on
`localhost`; no ingress patch is needed.

#### 4. The per-tenant lanes

```bash
pnpm run configure-email   # who mail leaves as: smtp -> the in-cluster Mailpit
pnpm run configure-sms     # Twilio Verify settings
pnpm run configure-sso     # the Google provider + its encrypted client secret
pnpm run configure-auth    # the auth policy, 2FA included
pnpm run configure-orgs    # every member may create organizations
```

- **email:** a hosted tenant installs no email module of its own. Its sender
  is two rows (a provider account and the default identity) in the platform's
  database-scope email plane, keyed by the tenant. Mailpit's UI at
  `http://localhost:18025` is the mailbox.
- **sms:** two configs and three secrets in the tenant's own `app`-scope stores
  (the ones `b2b:storage` installs), through the tenant's config API
  (`config-<slug>`). The Twilio Verify Service needs `CustomCodeEnabled=true`
  (the platform generates the digits).
- **sso:** the provider row in the identity module's private table, then
  `rotate_identity_provider_app_secret`, which encrypts the client secret into
  the tenant's secrets and points the provider at it.
- **auth:** one place for every `app_settings_auth` switch: the provider
  sign-in lanes, the host-only cookie, magic-link and SMS sign-in, the second
  factors on offer, and `require_mfa` from **`TWO_FACTOR`** (`on` by default:
  a password sign-in by a user with no second factor is sent to
  `/setup-2fa?required=1`; magic-link, SMS and SSO sign-ins are never flagged
  for setup). The row is guarded by the tenant's 2FA posture: inside six hours
  of the owner's bootstrap the owner's password session may write it; after
  that the step fails, naming the guard, because the columns need a fresh MFA
  proof. Only changed columns are written, so a re-run with nothing to change
  never meets the guard. Optional **`STEP_UP_WINDOW`** (a Postgres interval,
  e.g. `'2 minutes'`) sets how recently a session must have signed in or
  verified a code before a step-up-guarded write — deleting an organization
  (`STEP_UP_REQUIRED_FRESH_AUTH`, planning#2297) or adding a phone. Unset
  keeps the tenant default of 30 minutes; shorten it to see the app's step-up
  dialog without waiting. Optional **`NATIVE_REDIRECT_URIS`** (comma-separated)
  lists the deep links a desktop or mobile app may have the hosted Google and
  magic-link pages hand a sign-in back to (constructive-db #4155); listing any
  also allows loopback on any port. Unset leaves the tenant's list, empty by
  default; set but empty clears it.
- **orgs:** through the tenant's admin GraphQL. New members arrive approved +
  verified (their membership is active), and `create_entity` joins the default
  capability panel every new member inherits. **LOCAL WORKAROUND:** the panel's
  recompute trigger fires BEFORE the row it should count lands
  (`memberships_module` creates it with PostgreSQL's BEFORE bit under a comment
  that says AFTER), so the first grant leaves the panel all zeros; a no-op
  UPDATE of that row, as the owner's tenant session, re-runs the trigger with
  the row present.

#### 5. Regenerate the GraphQL SDK

`local:bringup` runs `pnpm codegen` (`scripts/codegen.sh`) right before
starting the app. Codegen introspects the tenant's live GraphQL hosts
(`admin-/auth-<slug>.localhost`, port 80 — the slug is the
`NEXT_PUBLIC_DB_NAME` `create-db` writes) and regenerates `src/graphql/sdk/`,
which is **committed generated output**: the step is a no-op diff when the
platform schema hasn't drifted and a healing refresh when it has. There is no
`app` (business data) target — this template's tenants have no app-context
tables, and the generator rejects empty schemas. Run `pnpm codegen` alone
after a platform image change, or before adding new GraphQL fields to the app.

#### 6. Start the app

```bash
pnpm dev
```

The app runs on `http://localhost:3000`. Signed-out, the home page shows the
provider grid; **Sign in with Google** navigates straight to the gateway's
`/auth/start` (mantra's `oauth_start` page — the `sso` preset routes it),
which mints state + PKCE and sends the browser to the provider. The provider
returns to `http://localhost:3000/auth/callback` (the registered redirect
URI), which this app relays verbatim to the gateway's `/auth/callback` page —
the session cookie comes back through the relay and you land signed in.
`/login`, `/register`, `/forgot-password`, `/reset-password` are thin redirects
to mantra's own pages on the gateway.

#### Verify it works

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/     # 200 (the app)
# The SSO start page on the gateway (the `sso` preset routes it): 302 to Google.
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  "http://localhost/auth/start?provider=google&next=%2F"
```

## The two planes (auth surfaces vs. GraphQL data)

The app talks to its tenant over two separate planes, both behind the same
Traefik ingress on port 80:

- **Auth surfaces** (mantra pages + sync lanes): the browser navigates straight
  to the gateway (`http://localhost`) for mantra's pages and the OAuth start.
  The app's own origin only relays the provider's return leg
  (`/auth/callback`) and answers `/api/auth/session` + `/api/auth/sign-out`
  by forwarding the HttpOnly session cookie as a Bearer credential. The
  credential never reaches client JS. Cookies ignore port, so the host-only
  `localhost` cookie set by the gateway on `:80` is sent to the app on `:3000`.
- **GraphQL** (orgs, members, account settings): the platform auto-provisions
  per-tenant GraphQL hosts named from the tenant's internal slug (e.g.
  `admin-208-dry-rose-fox.localhost`) — NOT from `DATABASE_NAME`. The session
  cookie is host-only on `localhost` and never crosses to those hosts, so the
  SDK's endpoints point at the same-origin proxy (`/api/graphql/{admin,auth}`)
  which forwards server-side. `create-db` derives the slug and writes
  `NEXT_PUBLIC_DB_NAME` / `NEXT_PUBLIC_*_ENDPOINT` / `GRAPHQL_*_URL` into
  `.env` for exactly this reason.

## SSO Testing

Put the provider credentials in `.env` (and keep the Console redirect URI
exactly `http://localhost:3000/auth/callback`):

```
OAUTH_PROVIDER=google
OAUTH_CLIENT_ID=<your-google-client-id>
OAUTH_CLIENT_SECRET=<your-google-client-secret>
OAUTH_ISSUER_URL=https://accounts.google.com
OAUTH_AUTHORIZE_URL=https://accounts.google.com/o/oauth2/v2/auth
OAUTH_TOKEN_URL=https://oauth2.googleapis.com/token
OAUTH_USERINFO_URL=https://openidconnect.googleapis.com/v1/userinfo
OAUTH_SCOPES=openid,email,profile
```

Then the flow is:

1. Home page → **Sign in with Google** → the browser navigates to the
   gateway's `/auth/start?provider=google&next=/` (mantra's `oauth_start`).
2. `oauth_start` mints state + PKCE and composes the redirect URI
   from the site's `canonical_url`, then sends the browser to the provider.
3. The provider redirects to `http://localhost:3000/auth/callback` (the
   registered URI). The app relays it verbatim to the gateway's page lane
   (`localhost/auth/callback` = mantra's `oauth_callback`), which exchanges the
   code, mints the session, and sets the `constructive_session` cookie
   (host-only on `localhost`) — both come back through the relay.
4. mantra 302s to `next` (`/`); the app reads the cookie via
   `/api/auth/session` → signed-in dashboard.

### Testing without Google (the mock IdP)

Point the `OAUTH_*` values at the bundled mock (`pnpm mock-oauth`, `:4010`) and
rerun `pnpm run configure-sso`. The mock's endpoints carry its URLs and
`OAUTH_ISSUER_URL=http://localhost:4010`; it auto-consents, so the flow runs
without a Google Console. (The token/userinfo URLs may need a pod-reachable
host form of `localhost` — see the test guide.)

## Re-runs / restarts

- **Only mantra UI code changed?** No teardown needed. Rebuild the combined
  image and reload it, then hit `/login` to cold-start a fresh pod:

  ```bash
  cd constructive-db
  docker build -t constructive-functions:local -f compute/Dockerfile.dev .
  docker tag constructive-functions:local dev.local/constructive-functions:local
  kind load docker-image constructive-functions:local dev.local/constructive-functions:local --name constructive
  curl -s -o /dev/null http://localhost/login
  ```

  (fun up itself rebuilds this image, so this is only for the loop between
  bring-ups.)
- **After a computer reboot without teardown:** nodes come back Ready but all
  workload pods hang `Unknown` — that is the known Cilium stale apiserver-IP
  pin (Docker re-creates the kind bridge). Fix:
  `kubectl get nodes -o wide` for the current control-plane IP, then
  `kubectl set env ds/cilium -n kube-system KUBERNETES_SERVICE_HOST=<new-ip>`
  (same for `deploy/cilium-operator` and `ds/cilium-envoy`), force-delete the
  pods stuck in `Unknown`, and re-run the step-1 port-forward. Then
  `pnpm run local:bringup`.
- **Docker restart only, pods still Running:** just re-run the port-forward
  and `pnpm run local:bringup`.
- **More than six hours after the owner's bootstrap,** `configure-auth` can no
  longer change the auth policy with a password session (the 2FA posture). An
  unchanged policy is skipped, so a plain re-run still passes; to change it,
  start from a fresh platform (Part A step 0).
- **`ACCOUNT_LOCKED_EXCEED_ATTEMPTS` on sign-in:** repeated failed sign-ins (a
  wrong `OWNER_PASSWORD`) lock the owner for a while. Fix the password, wait
  for the lock to expire, re-run.

## Debugging

```bash
psql -P pager=off -h localhost -p 15432 -U postgres -d constructive-functions-db1
```

```sql
-- the tenant's bound routes on localhost
SELECT r.path, f.task_identifier, r.config
  FROM routing_public.routes r
  LEFT JOIN catalog_private.functions f ON f.id = r.target_function_id
 WHERE r.database_id = '<DATABASE_ID>' ORDER BY r.path;

-- the tenant's identity provider table, from its module row
SELECT s.schema_name, t.name
  FROM metaschema_modules_public.identity_providers_module ipm
  JOIN metaschema_public.schema s ON s.id = ipm.private_schema_id
  JOIN metaschema_public.table t ON t.id = ipm.table_id
 WHERE ipm.database_id = '<DATABASE_ID>';
```

Gateway logs: `kubectl logs deploy/compute-sync -n constructive-platform-default`.

## Structure

| Path                          | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `src/`                        | Next.js app (product, account, app shell)                    |
| `src/app/auth/callback/route.ts` | Provider redirect target; relays to the gateway page lane |
| `src/app/api/auth/session/`   | BFF: currentUser on the tenant's auth GraphQL (Bearer)       |
| `src/app/api/auth/sign-out/`  | BFF: signOut on the auth GraphQL; cookie always cleared      |
| `src/app/api/custom-auth/*`   | BFF: password sign-in / forgot / reset — signIn, forgotPassword, resetPassword on the auth GraphQL |
| `src/app/api/auth/send-sms-otp/` + `verify-sms-otp/` | BFF: sendSmsOtp / signInSmsOtp on the auth GraphQL |
| `src/app/api/auth/step-up/`   | BFF: sendStepUpCode / verifyStepUpCode on the auth GraphQL   |
| `src/lib/sso/auth-graphql.ts` | the server-only auth-GraphQL client all of the above share (Bearer = session cookie; forwards user-agent + origin — step-up compares them) |
| `packages/provision`          | Part B's steps: `create-db`, `ensure-site`, `configure-{email,sms,sso,auth,orgs}`; `realm.ts` is who they act as |
| `packages/export`             | `export:graphql` (legacy GraphQL export; not used by SSO)    |
| `scripts/local-bringup.sh`    | runs ALL of Part B: create-db → ensure-site → configure-* → codegen → dev |
| `src/graphql/sdk/`            | generated GraphQL SDK (committed; regenerated by `local:bringup` / `pnpm codegen`) |
| `scripts/mock-oauth-server.ts`| local mock OAuth server for Google-free testing (`:4010`)    |

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.
