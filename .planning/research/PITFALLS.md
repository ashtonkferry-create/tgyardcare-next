# Domain Pitfalls: Lovable + Supabase + n8n + Jobber Integration

**Domain:** Service business website with multi-platform integrations
**Researched:** 2026-02-02
**Project:** TotalGuard Yard Care (Lovable → GitHub → Supabase → n8n → Jobber)

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major production issues.

### Pitfall 1: Lovable-GitHub Repository Name/Path Dependencies

**What goes wrong:** The Lovable-GitHub connection breaks permanently if you rename your GitHub username, organization, or repository after connecting. Projects stop syncing, displaying "We can't access your repository" errors.

**Why it happens:** Lovable's GitHub integration depends on exact repository name, location, organization, and account. The connection is path-dependent rather than using repository IDs.

**Consequences:**
- Complete loss of sync between Lovable and GitHub
- Cannot reconnect to renamed repository
- Must create new repository and lose git history or manually reconfigure

**Prevention:**
- Finalize GitHub username and organization structure BEFORE connecting Lovable
- Document repository naming convention in project setup phase
- Never rename, move, or transfer repository after Lovable connection established
- If migration is necessary, plan for complete disconnection and reconnection workflow

**Detection:**
- "We can't access your repository" error in Lovable
- GitHub app installation missing from organization/account
- Sync failures after any organizational changes

**Phase mapping:** Phase 1 (Infrastructure Setup) - Lock in GitHub repository structure before any Lovable connections.

**Sources:**
- [Third-party app (Lovable) can't access repository after GitHub organization rename](https://github.com/orgs/community/discussions/154720)
- [The Lovable.dev Migration Guide](https://dev.to/danielbetterdevelopers/the-lovabledev-migration-guide-moving-from-personal-github-to-an-organization-without-breaking-100n)

---

### Pitfall 2: Supabase onAuthStateChange Deadlocks

**What goes wrong:** Application freezes after user login, form submission, or page refresh with authenticated user. Browser appears to hang indefinitely.

**Why it happens:** Making asynchronous calls to Supabase tables (like profiles) inside `onAuthStateChange` creates deadlocks. This violates Supabase's documented anti-pattern.

**Consequences:**
- Users cannot complete registration or login flows
- Application appears broken in production
- Form submissions with authentication fail silently
- Poor user experience leading to abandonment

**Prevention:**
- Never make direct database queries inside `onAuthStateChange` callback
- Use separate effect/function triggered after auth state is confirmed
- Follow Supabase documentation pattern for profile creation/updates
- Test authentication flows thoroughly before production deployment

**Detection:**
- Application hangs/freezes after login
- Browser dev console shows pending requests that never complete
- No error messages, just infinite loading state
- Issue occurs specifically during auth state transitions

**Phase mapping:** Phase 2 (Authentication Setup) - Implement auth flows following Supabase documented patterns, avoiding common deadlock scenarios.

**Sources:**
- [Lovable + Supabase: Application hangs up after user logs in](https://tomaspozo.com/articles/series-lovable-supabase-errors-application-hangs-up-after-log-in)
- [Lovable and Supabase Troubleshooting Tips](https://lovable.dev/video/lovable-and-supabase-troubleshooting-tips)

---

### Pitfall 3: Supabase Webhook Batch Timeout (2-Second Limit)

**What goes wrong:** Webhooks fail with mass timeout errors when processing queued requests. Entire batches fail if not completed within 2 seconds.

**Why it happens:** Supabase's `pg_net` extension executes up to 200 queued requests in batches. If processing takes longer than 2 seconds for the entire batch, every request in that batch times out.

**Consequences:**
- Webhook-triggered workflows in n8n never execute
- Data sync between Supabase and external systems fails
- Silent failures with timeout error messages only visible in logs
- Cascading failures during high-volume periods

**Prevention:**
- Design webhook endpoints to respond within 1 second (Jobber requirement) or handle asynchronously
- Implement queue-based processing: acknowledge immediately, process later
- Monitor webhook execution time in Supabase logs
- Increase webhook timeout settings where possible
- Use lightweight webhook payloads that trigger async processing

**Detection:**
- Mass webhook failures in Supabase logs with timeout messages
- n8n workflows not triggering despite database changes
- Gaps in data synchronization during high-activity periods
- Error messages mentioning "timeout" in batch processing

**Phase mapping:** Phase 3 (Webhook Integration) - Design for async processing from the start. Test under realistic load conditions.

**Sources:**
- [Supabase Webhook Debugging Guide](https://supabase.com/docs/guides/troubleshooting/webhook-debugging-guide-M8sk47)
- [Webhooks fail when multiple inserts are done](https://github.com/supabase/pg_net/issues/86)

---

### Pitfall 4: Jobber Webhook Race Conditions and Duplicate Delivery

**What goes wrong:** Jobber frequently sends two webhooks at the same second for a single update, creating race conditions. Additionally, webhooks may be delivered multiple times (at-least-once delivery).

**Consequences:**
- Duplicate records created in Supabase/n8n workflows
- Race conditions where second webhook overwrites first with stale data
- Inconsistent state across systems
- Data integrity issues requiring manual cleanup

**Prevention:**
- Implement idempotent webhook handlers using unique event IDs
- Use distributed locks (Redis/database) to prevent concurrent processing of same entity
- Check for duplicate webhooks based on payload data
- Add delay/queue mechanism (e.g., Hookdeck to deliver every 4 seconds)
- Store processed webhook IDs to detect duplicates

**Detection:**
- Duplicate customer/job records appearing in CRM
- Race condition errors in logs
- Same webhook payload received multiple times
- Inconsistent data states between Jobber and Supabase

**Phase mapping:** Phase 4 (Jobber Integration) - Build idempotency and deduplication logic before production use. Test with rapid successive updates.

**Sources:**
- [Understanding Webhooks - Advanced Jobber Integration](https://support.advancedjobberintegration.com/portal/en/kb/articles/understanding-webhooks)
- [Setting up Webhooks (Jobber Developer Docs)](https://developer.getjobber.com/docs/using_jobbers_api/setting_up_webhooks/)

---

### Pitfall 5: OAuth Token Refresh Race Conditions

**What goes wrong:** Multiple n8n workflows attempting to refresh the same OAuth token simultaneously cause race conditions, potentially overwriting valid tokens with expired ones or losing refresh tokens entirely.

**Consequences:**
- Complete loss of API access requiring user re-authentication
- Intermittent integration failures that are hard to debug
- "Invalid grant" or "revoked refresh token" errors
- Service disruption during high-load periods

**Prevention:**
- Implement locking mechanism (Redis for multi-instance, in-memory for single-instance)
- Use cron job to proactively refresh tokens before expiration (e.g., daily)
- Implement proper error handling for token refresh failures
- Store tokens securely with version tracking
- Monitor token expiration and set alerts
- Include `offline_access` scope in OAuth configuration

**Detection:**
- Sporadic "invalid_grant" errors in n8n logs
- Workflows failing with authentication errors under load
- Multiple token refresh attempts in quick succession
- Integration works intermittently

**Phase mapping:** Phase 3-4 (API Integrations) - Implement centralized token management before connecting multiple workflows to same OAuth provider.

**Sources:**
- [How to handle concurrency with OAuth token refreshes](https://nango.dev/blog/concurrency-with-oauth-token-refreshes)
- [Salesforce OAuth refresh token invalid_grant](https://nango.dev/blog/salesforce-oauth-refresh-token-invalid-grant)

---

### Pitfall 6: Hardcoded Localhost in Webhook URLs

**What goes wrong:** Using `localhost` or `127.0.0.1` in webhook URLs causes webhooks to target the container itself rather than the intended service, resulting in connection failures.

**Consequences:**
- Webhooks never reach n8n or receiving services
- Silent failures with connection refused errors
- Local development works but Docker deployment fails
- Complete breakdown of webhook-based automation

**Prevention:**
- For Docker deployments, use `host.docker.internal` to target host machine
- For Supabase local development with n8n, use container name (e.g., `supabase-kong:8000`)
- Use fully qualified domain names or public URLs for production
- Document correct webhook URL patterns for each environment
- Test webhook delivery in each deployment environment

**Detection:**
- Webhooks timing out or showing connection refused
- Works locally but fails in Docker/production
- Error logs showing localhost connection attempts
- n8n webhook endpoints not receiving any requests

**Phase mapping:** Phase 1 (Environment Setup) - Establish correct networking patterns and webhook URL conventions for each environment.

**Sources:**
- [Supabase Webhook Debugging Guide](https://supabase.com/docs/guides/troubleshooting/webhook-debugging-guide-M8sk47)
- [Supabase node common issues](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/common-issues/)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or require significant refactoring.

### Pitfall 7: Row Level Security (RLS) Policy Misconfiguration

**What goes wrong:** Supabase queries return empty results through the API (including n8n node) but work fine with direct Postgres client or in SQL Editor. Forms appear to submit successfully but data isn't accessible.

**Why it happens:** Supabase automatically enables RLS when creating tables via Table Editor. Without proper policies, the public `anon` key cannot read data even though it was successfully written.

**Prevention:**
- Create RLS policies immediately after creating tables
- Document which roles need access to which tables
- Test API access with anon key before integrating with n8n
- Use Supabase dashboard policy templates as starting point
- Implement policies for both read and write operations

**Detection:**
- n8n Supabase node returns empty arrays
- Same query works in SQL Editor
- "No rows returned" despite data existing in database
- Form submissions succeed but data doesn't appear in queries

**Phase mapping:** Phase 2 (Database Setup) - Create RLS policies as part of table creation process, not as afterthought.

**Sources:**
- [Supabase node common issues](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/common-issues/)
- [n8n webhook issue #31164](https://github.com/supabase/supabase/issues/31164)

---

### Pitfall 8: Environment Variables in Production

**What goes wrong:** Storing secrets in plain environment variables exposes them to logs, crash dumps, debugging tools, and any process with sufficient access. Production systems face different threat vectors than local development.

**Consequences:**
- API keys exposed in container logs or error reports
- Security vulnerabilities in production environment
- Compliance violations for sensitive customer data
- Difficult credential rotation and management

**Prevention:**
- Use dedicated secrets manager (Doppler, HashiCorp Vault, AWS Secrets Manager)
- Implement automated credential rotation
- Never commit `.env` files to repositories (even if gitignored)
- Use Lovable's secure environment variable UI for sensitive data
- Separate dev/staging/production secrets completely
- Encrypt secrets at rest and in transit

**Detection:**
- Secrets visible in application logs
- Environment variables accessible via debugging endpoints
- Credentials stored in plaintext in deployment configs
- No audit trail for secret access

**Phase mapping:** Phase 1 (Infrastructure Setup) - Establish secrets management pattern before storing any API keys or credentials.

**Sources:**
- [Are environment variables still safe for secrets in 2026?](https://securityboulevard.com/2025/12/are-environment-variables-still-safe-for-secrets-in-2026/)
- [Best Practices for Environment Variables Secrets Management](https://blog.gitguardian.com/secure-your-secrets-with-env/)
- [Configuring Environment Variables in Lovable](https://www.rapidevelopers.com/lovable-issues/configuring-environment-variables-in-lovable-deployment-settings)

---

### Pitfall 9: Missing n8n Error Workflows and Monitoring

**What goes wrong:** n8n workflows fail silently without notification. Errors go undetected until users report broken functionality, causing prolonged outages.

**Consequences:**
- Form submissions appear successful but data never reaches Jobber
- Email notifications never sent
- Extended downtime before issues discovered
- Difficult debugging without error context
- Loss of customer trust

**Prevention:**
- Create centralized Error Workflow using Error Trigger node
- Configure all production workflows to use same error handler
- Set up multiple notification channels (Slack, email, SMS)
- Include workflow name, error message, execution ID in alerts
- Log errors to database/Google Sheets for audit trail
- Monitor workflow execution success rates
- Set up hourly scheduled check for failed executions

**Detection:**
- Users report functionality not working
- No alerts despite workflow failures
- Execution logs showing errors but no notifications
- Gaps in data synchronization discovered later

**Phase mapping:** Phase 3 (n8n Setup) - Implement error handling and monitoring infrastructure before building complex workflows.

**Sources:**
- [n8n Error Handling](https://docs.n8n.io/flow-logic/error-handling/)
- [Stop Silent Failures: n8n Error Handling System](https://nextgrowth.ai/n8n-workflow-error-alerts-guide/)
- [n8n Monitoring and Alerting for Production](https://www.wednesday.is/writing-articles/n8n-monitoring-and-alerting-setup-for-production-environments)

---

### Pitfall 10: Database Migration Applied Directly to Production

**What goes wrong:** Schema changes pushed directly to production without testing cause data loss, breaking changes, or application crashes. Migrations cannot be easily rolled back.

**Consequences:**
- Production data corruption or loss
- Application downtime
- Inability to rollback problematic changes
- Emergency fixes under pressure
- Customer-facing service disruption

**Prevention:**
- Use separate Supabase projects for dev/staging/production
- Test migrations locally first using `supabase db reset` and `supabase db push`
- Review generated migration files for correctness (diff tool makes mistakes)
- Use CI/CD pipeline (GitHub Actions) for production deployments
- Never use `supabase db push` directly to production
- Never reset a version already deployed to production
- Maintain migration rollback scripts

**Detection:**
- Unexpected schema changes in production
- Application errors after deployment
- Missing or altered table columns
- Data type mismatches

**Phase mapping:** Phase 2 (Database Setup) - Establish migration workflow with proper environments before making any schema changes.

**Sources:**
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Managing Environments (Supabase)](https://supabase.com/docs/guides/deployment/managing-environments)
- [Supabase Managing database migrations across environments](https://dev.to/parth24072001/supabase-managing-database-migrations-across-multiple-environments-local-staging-production-4emg)

---

### Pitfall 11: Jobber API Rate Limit (10,000 Query Cost)

**What goes wrong:** Jobber GraphQL API uses query cost calculation where complex queries consume more of the 10,000 limit. Hitting the rate limit blocks all API access.

**Consequences:**
- n8n workflows fail mid-execution
- Cannot sync new jobs or customers
- Batch operations fail partway through
- Service interruption until rate limit resets

**Prevention:**
- Design queries to minimize cost (request only needed fields)
- Implement request throttling in n8n workflows
- Cache frequently accessed data
- Use webhooks for real-time updates instead of polling
- Monitor API usage and set alerts at 80% threshold
- Batch operations during off-peak hours
- Calculate query cost before executing complex operations

**Detection:**
- Rate limit errors from Jobber API
- n8n workflows failing with 429 status codes
- Sudden inability to access Jobber API
- Errors mentioning "query cost" or "rate limit exceeded"

**Phase mapping:** Phase 4 (Jobber Integration) - Design API usage patterns with rate limits in mind. Implement throttling before production use.

**Sources:**
- [Jobber API Essentials](https://rollout.com/integration-guides/jobber/api-essentials)
- [Building an App in Jobber Platform](https://dev.to/jobber/building-an-app-in-jobber-platform-5259)

---

### Pitfall 12: CORS Errors on Form Submissions

**What goes wrong:** Browser blocks form submissions from Lovable website to Supabase or external APIs due to missing CORS headers. Forms appear to submit but fail silently or with cryptic errors.

**Consequences:**
- Forms don't work in production despite working in development
- Customer inquiries lost
- Poor user experience
- Difficult to debug for non-technical stakeholders

**Prevention:**
- Configure CORS headers in Supabase Edge Functions
- Use Supabase client libraries (handle CORS automatically)
- For external APIs, implement serverless proxy/edge function
- Test form submissions from actual domain (not localhost)
- Configure Lovable Cloud CORS settings if using external APIs
- Enable proper Access-Control headers on API endpoints

**Detection:**
- Browser console shows CORS policy errors
- Network tab shows OPTIONS preflight requests failing
- Form submits but receives no response
- Errors mentioning "Access-Control-Allow-Origin"

**Phase mapping:** Phase 2 (Form Integration) - Configure CORS before deploying forms to production domain.

**Sources:**
- [How to fix CORS errors in API development](https://www.contentstack.com/blog/tech-talk/how-to-identify-and-resolve-cors-errors-in-api-development)
- [The only article you ever need to read about CORS (2026 Guide)](https://corsproxy.io/blog/everything-about-cors/)

---

## Minor Pitfalls

Mistakes that cause annoyance or require small fixes, but are easily correctable.

### Pitfall 13: Duplicate n8n Webhook Executions

**What goes wrong:** Every webhook sent to n8n triggers 2 executions instead of 1, occurring within 30-70 milliseconds of each other. This doubles execution usage.

**Prevention:**
- Implement deduplication logic in first node (check execution ID)
- Use webhook node's "Return immediately" option
- Add small delay + check for recent executions
- Monitor execution logs for duplicates

**Detection:**
- Execution logs showing pairs of identical runs
- Double the expected execution count
- Duplicate data in downstream systems

**Phase mapping:** Phase 3 (n8n Setup) - Add deduplication checks to webhook-triggered workflows.

**Sources:**
- [Webhook receiving duplicate executions](https://community.n8n.io/t/duplicated-webhook-executions/197126)

---

### Pitfall 14: Anonymous Sign-in Disabled Errors

**What goes wrong:** Supabase signup fails with "Anonymous sign-ins are disabled" when email field is null or empty string, despite not attempting anonymous authentication.

**Prevention:**
- Validate form data before passing to Supabase
- Add console logging to verify email is set properly
- Ensure form field names match Supabase expectations
- Enable better error messages in Lovable UI

**Detection:**
- Signup fails with anonymous sign-in error message
- Email validation passes but Supabase call fails
- Console logs show null/empty email being sent

**Phase mapping:** Phase 2 (Authentication) - Add proper form validation and error handling for auth flows.

**Sources:**
- [Problem with sign up on website made through Lovable and Supabase](https://www.answeroverflow.com/m/1421913438531227749)

---

### Pitfall 15: Test vs Live Environment Confusion

**What goes wrong:** Changes made in Lovable Test environment don't appear in Live production site, or vice versa. Developers forget to publish Test to Live.

**Prevention:**
- Clearly label Test vs Live in documentation
- Establish workflow: develop in Test → test → publish to Live
- Use separate Supabase projects for Test and Live
- Document publishing process
- Set up automated reminders to publish after testing

**Detection:**
- Recent changes not visible on production site
- Bug fixes applied but still occurring in production
- Database data inconsistencies between environments

**Phase mapping:** Phase 1 (Project Setup) - Document environment workflow and publishing process from the start.

**Sources:**
- [Lovable Cloud Documentation](https://docs.lovable.dev/integrations/cloud)
- [How do you manage Dev vs Prod in Lovable?](https://www.producthunt.com/p/lovable/how-do-you-manage-dev-vs-prod-in-lovable)

---

### Pitfall 16: Email Deliverability Without SPF/DKIM/DMARC

**What goes wrong:** Transactional emails from n8n workflows go to spam or are rejected by Gmail/Outlook because sender domain lacks proper authentication.

**Consequences:**
- Customer notifications never received
- Users don't get confirmation emails
- Business appears unprofessional
- Compliance issues for important notifications

**Prevention:**
- Configure SPF, DKIM, and DMARC records for sending domain
- Use transactional email service (SendGrid, Mailgun, AWS SES)
- Keep spam rate below 0.3% (Gmail requirement)
- Test email deliverability before production
- Monitor bounce and spam complaint rates

**Detection:**
- Emails going to spam folders
- High bounce rates
- Users reporting they never received emails
- Postmaster Tools showing authentication failures

**Phase mapping:** Phase 5 (Email Notifications) - Configure email authentication before sending any customer-facing emails.

**Sources:**
- [Email Deliverability in 2026: SPF, DKIM, DMARC Checklist](https://www.egenconsulting.com/blog/email-deliverability-2026.html)
- [Google Email sender guidelines](https://support.google.com/a/answer/81126?hl=en)

---

### Pitfall 17: Webhook Signature Verification Skipped

**What goes wrong:** Skipping webhook signature verification allows attackers to send fake webhooks to n8n endpoints, potentially creating fraudulent records or triggering unauthorized actions.

**Prevention:**
- Always verify Jobber webhook signatures using X-Jobber-Hmac-SHA256 header
- Validate signature before processing payload
- Return 401/403 for invalid signatures
- Store OAuth client secret securely for signature verification

**Detection:**
- Unexpected records appearing in system
- Webhooks with suspicious patterns
- Missing standard headers in webhook requests

**Phase mapping:** Phase 4 (Jobber Integration) - Implement signature verification in initial webhook handler implementation.

**Sources:**
- [Setting up Webhooks (Jobber)](https://developer.getjobber.com/docs/using_jobbers_api/setting_up_webhooks/)

---

### Pitfall 18: Missing Retry Logic for API Failures

**What goes wrong:** Transient API failures (network timeouts, temporary service unavailability) cause permanent workflow failures instead of retrying.

**Prevention:**
- Enable retry settings on n8n nodes for external API calls
- Use exponential backoff (1s, 2s, 4s delays)
- Implement 3-5 retry attempts for transient errors
- Don't retry 4xx errors (bad requests, auth issues)
- Do retry 5xx errors and 429 rate limits
- Add jitter to prevent thundering herd

**Detection:**
- Workflows failing with timeout errors
- Sporadic failures that succeed on manual retry
- Network-related error messages

**Phase mapping:** Phase 3-4 (API Integrations) - Configure retry logic when setting up API nodes.

**Sources:**
- [Retry with backoff pattern - AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html)
- [Better Retries with Exponential Backoff and Jitter](https://www.baeldung.com/resilience4j-backoff-jitter)

---

### Pitfall 19: CRM Duplicate Customer Records

**What goes wrong:** Form submissions from website create duplicate Jobber records when customer already exists, cluttering CRM and creating data quality issues.

**Prevention:**
- Check for existing customer before creating new record
- Use email or phone as unique identifier
- Implement deduplication logic in n8n workflow
- Update existing record instead of creating duplicate
- Consider using Jobber's native deduplication if available

**Detection:**
- Multiple records for same customer in Jobber
- Customer complaints about duplicate communications
- Reporting inaccuracies due to duplicate data

**Phase mapping:** Phase 4 (Jobber Integration) - Build deduplication logic into customer creation workflow.

**Sources:**
- [CRM data management guide: 10 best practices for 2026](https://monday.com/blog/crm-and-sales/crm-data-management/)
- [CRM Deduplication: How to Remove Duplicates](https://www.breakcold.com/blog/crm-deduplication)

---

### Pitfall 20: Local Webhook Testing Without Tunnel

**What goes wrong:** Cannot test webhooks from Supabase or Jobber to local n8n instance without public URL, blocking development workflow.

**Prevention:**
- Use webhook tunnel service (Hookdeck, Pinggy, LocalXpose, ngrok)
- For Supabase local dev, use container networking (host.docker.internal)
- Set up proper local development environment from start
- Document webhook testing workflow for team
- Consider using n8n Cloud for development to avoid tunnel complexity

**Detection:**
- Webhooks timing out during local development
- Cannot test webhook-triggered workflows locally
- Forced to deploy to production for testing

**Phase mapping:** Phase 1 (Development Environment) - Set up local webhook testing capability before building webhook-dependent features.

**Sources:**
- [Top 10 Ngrok alternatives in 2026](https://pinggy.io/blog/best_ngrok_alternatives/)
- [Testing Webhooks Locally: Why I Built a Better Alternative to ngrok](https://dev.to/abhineet_kumar_4ab251662b/testing-webhooks-locally-why-i-built-a-better-alternative-to-ngrok-544d)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Infrastructure Setup | Hardcoded localhost URLs, environment variable exposure | Establish webhook URL conventions, implement secrets manager |
| Phase 2: Database & Auth | RLS misconfiguration, onAuthStateChange deadlocks | Create RLS policies with tables, follow Supabase auth patterns |
| Phase 3: Webhook Integration | 2-second batch timeout, missing error workflows | Design for async processing, implement centralized error handling |
| Phase 4: Jobber Integration | Rate limits, race conditions, duplicate webhooks | Implement idempotency, throttling, deduplication |
| Phase 5: Email Notifications | Deliverability issues without SPF/DKIM | Configure email authentication before sending |
| Phase 6: Production Deployment | Test/Live confusion, missing monitoring | Document publishing workflow, set up comprehensive monitoring |

---

## Testing & Validation Checklist

Before production deployment, validate these potential pitfall areas:

### Infrastructure
- [ ] GitHub repository naming finalized (no future renames planned)
- [ ] Webhook URLs use correct hostnames for each environment
- [ ] Secrets managed through dedicated secrets manager, not env vars
- [ ] Local webhook testing setup documented and working

### Database & Authentication
- [ ] RLS policies created for all tables
- [ ] Auth flows tested (no deadlocks on login/signup)
- [ ] Migration workflow established (dev → staging → prod)
- [ ] Database triggers tested with multiple rapid inserts

### Webhooks & n8n
- [ ] Webhook handlers respond within 1 second
- [ ] Supabase webhook timeout settings reviewed
- [ ] n8n error workflows configured for all production workflows
- [ ] Webhook deduplication logic implemented
- [ ] Retry logic enabled for API nodes

### Jobber Integration
- [ ] API rate limit monitoring in place
- [ ] Webhook signature verification implemented
- [ ] Idempotency handling for duplicate webhooks
- [ ] Customer deduplication logic tested

### Email & Notifications
- [ ] SPF, DKIM, DMARC configured for sending domain
- [ ] Test emails delivered successfully (not spam)
- [ ] Error notification channels tested (Slack, email)

### OAuth & APIs
- [ ] Token refresh race condition handling implemented
- [ ] Exponential backoff retry logic configured
- [ ] CORS headers properly configured

### Environment Management
- [ ] Test vs Live publishing workflow documented
- [ ] Separate Supabase projects for each environment
- [ ] Environment-specific configurations isolated

---

## Sources

### Lovable & GitHub Integration
- [Connect your project to GitHub - Lovable Documentation](https://docs.lovable.dev/integrations/github)
- [Third-party app (Lovable) can't access repository after organization rename](https://github.com/orgs/community/discussions/154720)
- [The Lovable.dev Migration Guide](https://dev.to/danielbetterdevelopers/the-lovabledev-migration-guide-moving-from-personal-github-to-an-organization-without-breaking-100n)
- [Lovable Cloud - Lovable Documentation](https://docs.lovable.dev/integrations/cloud)

### Supabase Integration
- [Integrate a backend with Supabase - Lovable Documentation](https://docs.lovable.dev/integrations/supabase)
- [Lovable + Supabase: Application hangs up after user logs in](https://tomaspozo.com/articles/series-lovable-supabase-errors-application-hangs-up-after-log-in)
- [Supabase Webhook Debugging Guide](https://supabase.com/docs/guides/troubleshooting/webhook-debugging-guide-M8sk47)
- [Webhooks fail when multiple inserts are done](https://github.com/supabase/pg_net/issues/86)
- [Database Webhooks | Supabase Docs](https://supabase.com/docs/guides/database/webhooks)
- [Database Migrations | Supabase Docs](https://supabase.com/docs/guides/deployment/database-migrations)
- [Managing Environments | Supabase Docs](https://supabase.com/docs/guides/deployment/managing-environments)

### n8n Automation
- [5 n8n Workflow Mistakes That Quietly Break Automation](https://medium.com/@connect.hashblock/5-n8n-workflow-mistakes-that-quietly-break-automation-f1a4cfdac8bc)
- [n8n Error Handling](https://docs.n8n.io/flow-logic/error-handling/)
- [Stop Silent Failures: n8n Error Handling System](https://nextgrowth.ai/n8n-workflow-error-alerts-guide/)
- [n8n Monitoring and Alerting for Production](https://www.wednesday.is/writing-articles/n8n-monitoring-and-alerting-setup-for-production-environments)
- [Supabase node common issues | n8n Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/common-issues/)
- [Webhook receiving duplicate executions](https://community.n8n.io/t/duplicated-webhook-executions/197126)

### Jobber API
- [Setting up Webhooks (Jobber Developer Docs)](https://developer.getjobber.com/docs/using_jobbers_api/setting_up_webhooks/)
- [Jobber API Essentials](https://rollout.com/integration-guides/jobber/api-essentials)
- [Understanding Webhooks - Advanced Jobber Integration](https://support.advancedjobberintegration.com/portal/en/kb/articles/understanding-webhooks)
- [Building an App in Jobber Platform](https://dev.to/jobber/building-an-app-in-jobber-platform-5259)

### OAuth & Authentication
- [How to handle concurrency with OAuth token refreshes](https://nango.dev/blog/concurrency-with-oauth-token-refreshes)
- [Salesforce OAuth refresh token invalid_grant](https://nango.dev/blog/salesforce-oauth-refresh-token-invalid-grant)

### Webhook Best Practices
- [How can I synchronize multiple calls to the same webhook to prevent race conditions?](https://community.n8n.io/t/how-can-i-synchronize-multiple-calls-to-the-same-webhook-to-prevent-race-conditions/84613)
- [Integrating HubSpot with Salesforce using Webhooks](https://dev.to/callstacktech/integrating-hubspot-with-salesforce-using-webhooks-for-real-time-data-synchronization-2e84)
- [Using JS and Storage to mitigate webhook race conditions](https://community.zapier.com/show-tell-5/using-js-and-storage-to-mitigate-webhook-race-conditions-8774)

### Security & Secrets Management
- [Are environment variables still safe for secrets in 2026?](https://securityboulevard.com/2025/12/are-environment-variables-still-safe-for-secrets-in-2026/)
- [Best Practices for Environment Variables Secrets Management](https://blog.gitguardian.com/secure-your-secrets-with-env/)
- [Secrets Management in CI/CD Pipeline](https://devtron.ai/blog/secrets-management-in-ci-cd-pipeline/)

### CORS & API Integration
- [How to fix CORS errors in API development](https://www.contentstack.com/blog/tech-talk/how-to-identify-and-resolve-cors-errors-in-api-development)
- [The only article you ever need to read about CORS (2026 Guide)](https://corsproxy.io/blog/everything-about-cors/)

### Email Deliverability
- [Email Deliverability in 2026: SPF, DKIM, DMARC Checklist](https://www.egenconsulting.com/blog/email-deliverability-2026.html)
- [Google Email sender guidelines](https://support.google.com/a/answer/81126?hl=en)

### Retry Logic & Resilience
- [Retry with backoff pattern - AWS](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html)
- [Better Retries with Exponential Backoff and Jitter](https://www.baeldung.com/resilience4j-backoff-jitter)

### CRM Data Quality
- [CRM data management guide: 10 best practices for 2026](https://monday.com/blog/crm-and-sales/crm-data-management/)
- [CRM Deduplication: How to Remove Duplicates](https://www.breakcold.com/blog/crm-deduplication)

### Local Development & Testing
- [Top 10 Ngrok alternatives in 2026](https://pinggy.io/blog/best_ngrok_alternatives/)
- [Testing Webhooks Locally: Why I Built a Better Alternative to ngrok](https://dev.to/abhineet_kumar_4ab251662b/testing-webhooks-locally-why-i-built-a-better-alternative-to-ngrok-544d)
