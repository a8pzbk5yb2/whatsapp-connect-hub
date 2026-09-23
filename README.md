# WhatsApp Connect Hub

Multi-Tenant Meta WhatsApp SaaS

Production-Ready PRD & Master Development Prompt

1. PRODUCT OBJECTIVE

Build a production-ready multi-tenant WhatsApp SaaS platform that allows a platform owner to onboard and manage multiple customers' WhatsApp Business Accounts (WABA) through Meta's official APIs and Embedded Signup.

The platform owner owns and manages the Meta Developer App.

Clients should be able to connect their own Meta Business Portfolio, WhatsApp Business Account, and WhatsApp phone numbers through an automated Meta onboarding flow.

The system must eliminate routine manual WABA configuration by the platform administrator.

Important:

Use only official Meta WhatsApp Business Platform APIs and supported onboarding flows.

Do not bypass Meta authentication, business verification, phone verification, policy checks, permissions, or review requirements.

Client-owned WABAs and phone numbers must remain associated with the appropriate client's Meta Business assets.

Never expose Meta access tokens to frontend JavaScript.

All Meta API communication must happen through the backend.

Build the system for multiple tenants from day one.

2. RECOMMENDED TECH STACK

Frontend

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

React Router

TanStack Query

Zod

React Hook Form

Recharts

Backend

Laravel

PHP 8.3+

Laravel Sanctum

Laravel Queue

Laravel Scheduler

Laravel Events/Listeners

Laravel Notifications

Database

MySQL 8+

Redis for queues/cache

Optional object storage for media

Infrastructure

Nginx

PHP-FPM

Supervisor

Redis

MySQL

HTTPS

Docker-compatible deployment

External APIs

Meta Graph API

WhatsApp Business Platform

Meta Embedded Signup

Meta Webhooks

Use the currently configured Meta Graph API version through environment configuration. The initial target is Graph API v24.0.

Do not hard-code the Graph API version throughout the application.

3. HIGH-LEVEL ARCHITECTURE

                         META
                          │
                 Meta Developer App
                          │
                 Embedded Signup
                          │
              ┌───────────┴───────────┐
              │                       │
          Client A                 Client B
              │                       │
       Business Portfolio       Business Portfolio
              │                       │
             WABA                    WABA
              │                       │
         Phone Number            Phone Number
              │                       │
              └──────────┬────────────┘
                         │
                  YOUR SAAS PLATFORM
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Client API     Webhooks       Admin
          │              │              │
          └──────────────┼──────────────┘
                         │
                    MySQL + Redis

4. MULTI-TENANCY

Every customer must be isolated using a tenant/client ID.

Never allow one client to access another client's:

WABA

phone numbers

contacts

messages

templates

campaigns

API keys

webhooks

billing

wallet

analytics

Every tenant-owned database record must contain:

tenant_id

Backend authorization must always verify:

authenticated_user -> tenant -> resource

Never trust a tenant ID supplied by the frontend.

Use server-side authorization policies.

5. USER ROLES

Super Admin

Full platform access.

Permissions:

Manage tenants

Manage Meta integration

View all WABAs

View all phone numbers

View system logs

View webhook logs

Manage pricing

Manage plans

Manage platform settings

Manage API settings

Suspend tenants

View platform analytics

Tenant Owner

Permissions:

Manage company profile

Connect WhatsApp

Manage WABA

Manage phone numbers

Manage templates

Manage contacts

Create campaigns

Send messages

View messages

Create API keys

View usage

Manage billing

Tenant Staff

Permissions must be configurable.

Example:

messages.view
messages.send
contacts.manage
campaigns.manage
templates.view
templates.manage
analytics.view
settings.manage

6. META APP CONFIGURATION

Environment variables:

META_APP_ID=
META_APP_SECRET=
META_GRAPH_VERSION=v24.0
META_WEBHOOK_VERIFY_TOKEN=
META_WEBHOOK_SECRET=
META_CONFIG_ID=
META_REDIRECT_URI=
META_APP_SCOPES=

Never expose:

META_APP_SECRET
META_WEBHOOK_SECRET
META access tokens

to the React frontend.

Frontend may receive only non-sensitive configuration such as:

META_APP_ID
META_CONFIG_ID

when required by the official Embedded Signup implementation.

7. CLIENT REGISTRATION

Client registration:

Name
Email
Phone
Company Name
Password

After registration:

Account Created
        ↓
Email Verification
        ↓
Dashboard
        ↓
Connect WhatsApp

Optional:

2FA

phone verification

organization profile

billing profile

8. WHATSAPP ONBOARDING

Create a prominent button:

Connect WhatsApp

When clicked:

Frontend
   ↓
Initialize Meta Embedded Signup
   ↓
Meta authentication
   ↓
Meta business selection
   ↓
WABA selection/creation
   ↓
Phone number selection/addition
   ↓
Meta authorization
   ↓
Callback/message event
   ↓
Backend onboarding processor

The client must remain within Meta's official authorization experience.

Do not build fake Meta login screens.

Do not request the client's Facebook password.

9. EMBEDDED SIGNUP CALLBACK

Create a secure onboarding endpoint:

POST /api/meta/embedded-signup/callback

The frontend should send only the authorization/onboarding information returned by Meta's supported flow.

Backend must:

Validate request.

Validate authenticated tenant.

Validate Meta response.

Exchange credentials where required.

Retrieve relevant business/WABA information using Meta APIs.

Identify the WABA.

Retrieve phone numbers.

Save WABA.

Save phone number(s).

Encrypt credentials/tokens.

Subscribe the WABA to the platform webhook where supported.

Synchronize templates.

Synchronize account status.

Write audit log.

Return onboarding status.

10. WABA ONBOARDING STATE MACHINE

Implement explicit onboarding states:

started
authentication_pending
authorized
business_detected
waba_detected
phone_detected
webhook_pending
sync_pending
completed
failed
disconnected

Store errors safely.

Example:

{
  "status": "failed",
  "stage": "webhook_subscription",
  "code": "META_API_ERROR",
  "message": "Unable to subscribe WABA"
}

Do not expose sensitive Meta responses directly to clients.

11. AUTOMATIC WABA SYNCHRONIZATION

After successful onboarding, automatically retrieve relevant information.

Example resources:

Business Portfolio
WABA
Phone Numbers
Templates
Account status
Phone status
Quality information

Store Meta IDs.

Important identifiers:

business_id
waba_id
phone_number_id

Do not use display phone numbers as primary identifiers.

12. AUTOMATIC WEBHOOK SUBSCRIPTION

After WABA onboarding:

WABA
 ↓
Backend
 ↓
Meta API
 ↓
Subscribe application to WABA

Implement idempotency.

If already subscribed:

Do not create duplicate subscriptions.

Store:

webhook_subscribed
webhook_subscribed_at
last_webhook_test
webhook_status

Provide automatic retry for temporary failures.

13. WEBHOOK ENDPOINT

Create:

GET /webhooks/meta/whatsapp
POST /webhooks/meta/whatsapp

GET:

Verify Meta webhook challenge.

Validate verification token.

Return challenge exactly as required.

POST:

Validate Meta webhook request.

Parse event.

Identify WABA/phone number.

Resolve tenant.

Store event.

Queue processing.

Return HTTP 200 quickly.

Never perform expensive processing before acknowledging the webhook.

14. WEBHOOK EVENT PROCESSING

Use Redis queues.

Pipeline:

Meta
 ↓
Webhook Controller
 ↓
Validate
 ↓
Store raw event
 ↓
Queue
 ↓
Webhook Worker
 ↓
Resolve Tenant
 ↓
Process Event
 ↓
Update Database

Events to support:

messages
message status
sent
delivered
read
failed
incoming messages
template updates
phone number updates
account updates

Design the event processor to be extensible because Meta can add event types.

15. IDEMPOTENCY

Every webhook and outgoing message operation must support idempotency.

Create:

webhook_events

Fields:

id
event_hash
event_type
tenant_id
waba_id
phone_number_id
payload
processed
processed_at
created_at

Create a unique index on:

event_hash

Do not process duplicate webhook events twice.

16. TOKEN MANAGEMENT

Never store tokens as plain text.

Encrypt sensitive credentials using Laravel's encryption facilities or an equivalent secure KMS-backed solution.

Example:

encrypted_access_token

Store:

token_type
expires_at
issued_at
last_validated_at
status

Create a service:

MetaTokenService

Responsibilities:

Encrypt

Decrypt

Validate

Refresh where supported

Detect expired credentials

Rotate credentials

Revoke/disconnect credentials

Log token-related failures

Never log tokens.

Mask tokens in admin logs.

Example:

EAAG************9XYZ

17. META API SERVICE

Create a dedicated backend service:

MetaGraphService

Example methods:

getBusiness()
getWaba()
getPhoneNumbers()
getPhoneNumber()
getTemplates()
createTemplate()
getTemplate()
deleteTemplate()
sendMessage()
subscribeWaba()
getAccountStatus()

Do not call Meta APIs directly from React.

Centralize:

base URL
Graph version
authentication
timeouts
retries
rate-limit handling
logging
error normalization

18. MESSAGING API

Create internal API:

POST /api/v1/messages/send

Example request:

{
  "phone_number_id": "123456789",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "otp_template",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "123456"
          }
        ]
      }
    ]
  }
}

Backend:

Authenticate API key
        ↓
Resolve tenant
        ↓
Validate phone_number_id belongs to tenant
        ↓
Validate message
        ↓
Check account status
        ↓
Check credits/limits
        ↓
Send through Meta API
        ↓
Store message
        ↓
Return result

19. API KEY SYSTEM

Clients can create API keys.

Example:

Live API Key
Test API Key

Never store raw API keys.

Store:

key_hash
key_prefix
tenant_id
name
last_used_at
expires_at
status

Show the complete key only once after creation.

Support:

Create
Revoke
Rotate
Expire
IP restrictions
Rate limits

Example:

Authorization: Bearer wsa_live_xxxxxxxxx

20. MESSAGE DATABASE

Create:

messages

Fields:

id
tenant_id
waba_id
phone_number_id
contact_id
direction
message_type
meta_message_id
client_message_id
to_number
from_number
status
content
template_name
template_language
error_code
error_message
sent_at
delivered_at
read_at
failed_at
created_at
updated_at

Status:

queued
sent
delivered
read
failed

21. CONTACTS

Create:

contacts

Fields:

id
tenant_id
phone
name
country_code
profile_name
opt_in_status
last_message_at
metadata
created_at
updated_at

Add unique constraint:

tenant_id + phone

22. TEMPLATE MANAGEMENT

Client dashboard:

WhatsApp Templates

Features:

List templates

Search

Filter

View status

View category

View language

View components

Create template

Delete where supported

Sync from Meta

Statuses:

PENDING
APPROVED
REJECTED
PAUSED
DISABLED

Do not assume a template is approved immediately after submission.

23. CHAT INBOX

Build a modern WhatsApp-style inbox.

Layout:

┌──────────────┬─────────────────────────────┐
│ Conversations│                             │
│              │       Conversation          │
│ John         │                             │
│ +91xxxx      │  Hello                      │
│              │                 Hi          │
│ Sarah        │                             │
│ +91xxxx      │                             │
│              │  ┌───────────────────────┐  │
│              │  │ Type message...       │  │
│              │  └───────────────────────┘  │
└──────────────┴─────────────────────────────┘

Features:

Real-time updates

Search

Contact information

Message status

Media

Templates

Reply

Conversation history

Assignment to staff

Internal notes

Tags

Use WebSockets or an equivalent realtime system.

24. CAMPAIGNS

Create:

Campaigns

Fields:

campaign_id
tenant_id
name
phone_number_id
template_id
audience
scheduled_at
status
total
queued
sent
delivered
read
failed

Campaign states:

draft
scheduled
processing
completed
paused
cancelled
failed

Use queue workers.

Never send a huge campaign in a single synchronous HTTP request.

25. RATE LIMITING

Implement limits at multiple levels:

IP
User
Tenant
API key
Phone number

Example:

/api/v1/messages/send

must have configurable throttling.

Do not hard-code Meta messaging limits.

Store platform-level configuration separately.

26. BILLING / WALLET

Optional SaaS billing architecture:

wallets
wallet_transactions
plans
subscriptions
usage_records

Example transaction:

credit
debit
refund
adjustment

Every message usage record should contain:

tenant_id
message_id
amount
currency
reason
created_at

Use database transactions for wallet operations.

Never allow negative balance due to race conditions.

27. ADMIN DASHBOARD

Dashboard cards:

Total Clients
Connected WABAs
Connected Numbers
Messages Today
Messages This Month
Failed Messages
Active Campaigns
Webhook Errors

Charts:

Messages/day
Delivery rate
Read rate
Failure rate
Client growth
Usage

Admin pages:

Dashboard
Clients
WABAs
Phone Numbers
Templates
Messages
Campaigns
Webhooks
API Logs
Meta Errors
Billing
Plans
Settings
Audit Logs

28. CLIENT DASHBOARD

Pages:

Dashboard
WhatsApp
Inbox
Contacts
Templates
Campaigns
Messages
API
Webhooks
Analytics
Billing
Team
Settings

Dashboard:

WhatsApp Status
Connected Number
Messages Today
Messages This Month
Delivery Rate
Failed Messages
Current Balance
API Usage

29. WHATSAPP CONNECTION UI

Show:

WhatsApp Connection

Status: Connected

Business:
ABC Pvt Ltd

WABA:
123456789

Phone:
+91 XXXXX XXXXX

Quality:
Available from Meta API

[Refresh]
[Disconnect]

If disconnected:

WhatsApp not connected

[Connect WhatsApp]

30. DISCONNECT FLOW

Client clicks:

Disconnect WhatsApp

Show confirmation.

Backend should:

Mark connection disconnected.

Revoke/remove credentials where appropriate.

Stop outgoing messages.

Stop campaign processing.

Preserve historical messages.

Record audit event.

Never delete historical data automatically.

31. AUTOMATIC RECONCILIATION

Create scheduled jobs.

Example:

Every 15 minutes

Check:

WABA status
Phone number status
Templates
Connection health
Webhook status

If a connection becomes invalid:

connected
   ↓
health check
   ↓
invalid
   ↓
mark disconnected/problem
   ↓
notify tenant

32. QUEUE ARCHITECTURE

Use Redis queues:

meta-webhooks
meta-api
message-send
campaigns
template-sync
waba-sync
notifications
analytics

Workers must support:

Retry

Exponential backoff

Dead-letter handling

Maximum attempts

Structured logs

33. SECURITY REQUIREMENTS

Implement:

HTTPS only

CSRF protection

XSS protection

SQL injection protection

Secure cookies

Password hashing

2FA

RBAC

Tenant isolation

API rate limits

Request validation

Webhook verification

Encryption of sensitive credentials

Audit logs

Security headers

CORS restrictions

Secret management

No credentials in frontend

No credentials in logs

Never expose:

META_APP_SECRET
META access tokens
database password
Redis credentials
webhook secrets

34. AUDIT LOG

Create:

audit_logs

Store:

tenant_id
user_id
action
resource_type
resource_id
ip_address
user_agent
metadata
created_at

Examples:

WHATSAPP_CONNECTED
WHATSAPP_DISCONNECTED
API_KEY_CREATED
API_KEY_REVOKED
CAMPAIGN_CREATED
CAMPAIGN_STARTED
CAMPAIGN_CANCELLED
TEMPLATE_CREATED
USER_INVITED
SETTINGS_UPDATED

Never store passwords or access tokens in audit metadata.

35. DATABASE SCHEMA

Core tables:

users
tenants
tenant_users
roles
permissions
role_permissions

meta_businesses
whatsapp_accounts
whatsapp_numbers

meta_credentials
meta_webhook_events
meta_api_logs

contacts
contact_tags
messages
message_media
conversations
conversation_assignments

templates
template_components

campaigns
campaign_recipients

api_keys
api_request_logs

plans
subscriptions
wallets
wallet_transactions
usage_records

notifications
audit_logs
system_settings

Every tenant-owned table must contain:

tenant_id

where applicable.

36. IMPORTANT DATABASE RELATIONSHIPS

Tenant
 │
 ├── Users
 │
 ├── Meta Business
 │      │
 │      └── WABA
 │            │
 │            └── Phone Numbers
 │
 ├── Contacts
 │
 ├── Conversations
 │
 ├── Messages
 │
 ├── Templates
 │
 ├── Campaigns
 │
 ├── API Keys
 │
 └── Billing

37. BACKEND SERVICE STRUCTURE

Recommended Laravel structure:

app/
├── Actions/
│   ├── Meta/
│   ├── WhatsApp/
│   ├── Campaigns/
│   └── Billing/
│
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   ├── Meta/
│   │   ├── WhatsApp/
│   │   ├── Campaign/
│   │   └── Admin/
│   │
│   ├── Middleware/
│   └── Requests/
│
├── Models/
├── Policies/
├── Jobs/
├── Events/
├── Listeners/
├── Services/
│   ├── Meta/
│   │   ├── MetaGraphService.php
│   │   ├── MetaTokenService.php
│   │   ├── MetaWebhookService.php
│   │   └── WhatsAppService.php
│   └── Billing/
└── Notifications/

38. FRONTEND STRUCTURE

src/
├── components/
├── layouts/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── whatsapp/
│   ├── inbox/
│   ├── contacts/
│   ├── templates/
│   ├── campaigns/
│   ├── api/
│   ├── billing/
│   └── admin/
├── hooks/
├── services/
│   ├── api.ts
│   ├── meta.ts
│   └── websocket.ts
├── stores/
├── types/
└── utils/

39. API ROUTES

Authentication:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

WhatsApp:

GET  /api/whatsapp/accounts
POST /api/whatsapp/connect
POST /api/whatsapp/embedded-signup/callback
POST /api/whatsapp/{id}/sync
POST /api/whatsapp/{id}/disconnect
GET  /api/whatsapp/{id}/status

Numbers:

GET /api/whatsapp/numbers
GET /api/whatsapp/numbers/{id}

Messages:

POST /api/messages/send
GET  /api/messages
GET  /api/messages/{id}

Templates:

GET  /api/templates
POST /api/templates
GET  /api/templates/{id}
DELETE /api/templates/{id}
POST /api/templates/sync

Contacts:

GET /api/contacts
POST /api/contacts
PUT /api/contacts/{id}
DELETE /api/contacts/{id}

Campaigns:

GET  /api/campaigns
POST /api/campaigns
GET  /api/campaigns/{id}
POST /api/campaigns/{id}/start
POST /api/campaigns/{id}/pause
POST /api/campaigns/{id}/cancel

Webhooks:

GET  /webhooks/meta/whatsapp
POST /webhooks/meta/whatsapp

40. PUBLIC CLIENT API

Provide a versioned API:

/api/v1/

Example:

POST /api/v1/messages/send
GET /api/v1/messages/{id}
GET /api/v1/templates
GET /api/v1/phone-numbers
GET /api/v1/usage

Return consistent JSON:

{
  "success": true,
  "message": "Message submitted successfully",
  "data": {
    "message_id": "msg_123",
    "status": "queued"
  }
}

Error:

{
  "success": false,
  "message": "Unable to send message",
  "error": {
    "code": "WHATSAPP_NOT_CONNECTED"
  }
}

Never expose raw internal stack traces.

41. META ERROR NORMALIZATION

Convert Meta errors into safe application errors.

Example:

Meta Error
    ↓
MetaErrorService
    ↓
Application Error

Example:

{
  "code": "META_PERMISSION_ERROR",
  "message": "The connected WhatsApp Business Account does not have permission for this operation."
}

Store complete diagnostic information only in secured server logs.

42. OBSERVABILITY

Implement:

application logs
Meta API logs
Webhook logs
queue logs
authentication logs
audit logs

Admin should be able to search:

tenant
WABA
phone_number_id
request ID
message ID
Meta message ID
date
status
error

Generate a unique request ID for every API request.

43. TESTING

Create automated tests for:

Authentication

Registration

Login

Logout

Password reset

RBAC

Multi-tenancy

Tenant isolation

Cross-tenant access prevention

Policy enforcement

Meta

Embedded Signup callback

WABA synchronization

Phone synchronization

Template synchronization

Webhook verification

Webhook processing

Duplicate webhook handling

Meta error handling

Messaging

Template message

Text message where permitted

Failed message

Delivery status

Read status

Campaigns

Scheduling

Queue processing

Pause

Cancel

Retry

Security

Token leakage

Unauthorized API access

Invalid webhook

Rate limiting

SQL injection

XSS

44. DEVELOPMENT ENVIRONMENT

Provide:

APP_ENV=local
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

REDIS_HOST=
REDIS_PORT=6379

META_APP_ID=
META_APP_SECRET=
META_GRAPH_VERSION=v24.0
META_CONFIG_ID=
META_WEBHOOK_VERIFY_TOKEN=
META_WEBHOOK_SECRET=
META_REDIRECT_URI=

Never commit .env.

Provide:

.env.example

45. PRODUCTION DEPLOYMENT

Production architecture:

Internet
   │
Cloudflare
   │
Nginx
   │
Laravel
   │
├── PHP-FPM
├── Redis
├── Queue Workers
└── Scheduler
       │
     MySQL

Use Supervisor for:

queue workers

Scheduler:

php artisan schedule:work

Workers:

php artisan queue:work

Configure automatic restart.

46. CRON / SCHEDULER JOBS

Jobs:

Sync WABA health
Sync templates
Check token status
Process scheduled campaigns
Clean temporary data
Generate analytics
Detect webhook failures
Send tenant notifications

Do not rely on frontend activity for scheduled jobs.

47. UX REQUIREMENTS

Design should be modern SaaS.

Use:

Clean dashboard

Responsive design

Desktop-first admin

Mobile-friendly client dashboard

Sidebar navigation

Search

Filters

Tables

Status badges

Toast notifications

Confirmation dialogs

Loading skeletons

Empty states

Error states

WhatsApp connection status should be visually obvious.

48. ONBOARDING UX

New client:

Welcome
   ↓
Create Organization
   ↓
Connect WhatsApp
   ↓
Meta Embedded Signup
   ↓
Connection Processing
   ↓
WhatsApp Connected
   ↓
Dashboard

Show progress:

✓ Meta authorization
✓ Business detected
✓ WhatsApp account detected
✓ Phone number detected
✓ Webhook connected
✓ Templates synchronized

WhatsApp is ready!

If something fails:

Connection could not be completed.

Step:
Webhook Setup

Reason:
Meta did not accept the subscription request.

[Retry]
[View Help]

49. NO-MANUAL-SETUP PRINCIPLE

Normal client onboarding must not require an administrator to manually enter:

WABA ID
Phone Number ID
Access Token
Business ID
Webhook configuration

The platform should automatically obtain and configure supported information from Meta's official onboarding/API flow.

Admin intervention should exist only for exceptional cases such as:

Meta permission issue
Business verification issue
Unsupported account configuration
Platform configuration problem
Policy/review requirement

50. IMPORTANT META COMPLIANCE

Build the product around Meta's current policies and API requirements.

Do not:

collect Facebook passwords

bypass Meta authorization

automate unsupported account verification

circumvent messaging restrictions

hide opt-in requirements

send unsolicited messages

falsify business information

manipulate template approval

bypass Meta rate limits

store unnecessary personal data

The platform should support legitimate WhatsApp Business messaging.

51. ADMIN META SETTINGS

Admin-only page:

Meta Integration

App ID
App configuration
Graph API version
Webhook status
Webhook callback URL
Verification status
Environment

Sensitive values should be masked.

Example:

App ID:
123456789•••

App Secret:
••••••••••••

Webhook:
Connected

52. CONNECTION HEALTH

Create a health indicator:

🟢 Connected
🟡 Attention Required
🔴 Disconnected

Health checks:

Credentials valid
WABA accessible
Phone number accessible
Webhook active
Messaging available

53. PLATFORM SETTINGS

Admin:

Platform Name
Logo
Support Email
Default Currency
Timezone
Message Pricing
API Limits
Campaign Limits
Maintenance Mode
Registration
Email Verification
2FA

54. WHITE-LABEL SUPPORT

Prepare architecture for future white-labeling.

Tenant settings:

Company Name
Logo
Favicon
Brand Color
Support Email
Custom Domain

Do not implement custom-domain infrastructure unless explicitly required, but keep the database/API architecture extensible.

55. FINAL DELIVERABLES

The implementation must provide:

✓ React frontend
✓ Laravel backend
✓ MySQL migrations
✓ Models
✓ Controllers
✓ Services
✓ Policies
✓ Middleware
✓ Queue jobs
✓ Webhook handling
✓ Meta Embedded Signup integration
✓ WABA onboarding
✓ Automatic webhook subscription
✓ Token encryption
✓ Template synchronization
✓ Messaging API
✓ Client dashboard
✓ Admin dashboard
✓ Multi-tenancy
✓ API keys
✓ Contacts
✓ Inbox
✓ Campaigns
✓ Analytics
✓ Audit logs
✓ Error handling
✓ Rate limiting
✓ Tests
✓ Docker configuration
✓ Production deployment documentation
✓ .env.example
✓ API documentation

56. ACCEPTANCE CRITERIA

The project is considered complete when the following flow works:

1. Client registers
        ↓
2. Client verifies account
        ↓
3. Client enters dashboard
        ↓
4. Clicks "Connect WhatsApp"
        ↓
5. Meta Embedded Signup opens
        ↓
6. Client authorizes their Meta business
        ↓
7. Backend receives onboarding result
        ↓
8. Backend identifies WABA
        ↓
9. Backend identifies phone number
        ↓
10. Credentials are securely stored
        ↓
11. WABA webhook subscription is configured
        ↓
12. Templates synchronize
        ↓
13. WhatsApp status becomes Connected
        ↓
14. Client can send an approved template
        ↓
15. Meta message ID is stored
        ↓
16. Delivery webhook arrives
        ↓
17. Message status updates
        ↓
18. Client sees the updated status in dashboard

The entire normal onboarding flow must work without an administrator manually entering Meta IDs or tokens.

57. DEVELOPMENT INSTRUCTION

Build this as a real production SaaS application, not a prototype.

Prioritize:

Security

Tenant isolation

Correct Meta API integration

Reliable webhook processing

Idempotency

Queue-based messaging

Error handling

Observability

Maintainability

Modern UX

Do not create fake API responses or mock Meta integrations in production code.

Use service classes and dependency injection.

Do not put Meta API logic inside React components.

Do not put Meta API logic directly inside controllers when it belongs in a service.

Do not expose credentials to the browser.

Do not use hard-coded tenant IDs.

Do not use hard-coded WABA IDs.

Do not assume a phone number belongs to the authenticated tenant without server-side verification.

Use database transactions where multiple records must be created together.

Use queues for webhook and bulk-processing workloads.

Use idempotency for Meta events and message processing.

Create clear error messages for users while retaining detailed diagnostic information in secure server logs.

58. BUILD PHASES

Phase 1

Foundation:

Authentication
Users
Tenants
RBAC
Database
Admin
Client dashboard

Phase 2

Meta:

Meta App configuration
Embedded Signup
OAuth/onboarding
WABA discovery
Phone discovery
Token storage

Phase 3

Webhooks:

Webhook verification
Event ingestion
Queue processing
Message status
Incoming messages

Phase 4

Messaging:

Templates
Send API
Contacts
Inbox
Message history

Phase 5

Campaigns:

Campaign builder
Audience
Scheduling
Queues
Reports

Phase 6

SaaS:

API keys
Usage
Wallet
Billing
Plans
Limits

Phase 7

Production:

Security audit
Tests
Monitoring
Logs
Backups
Docker
Deployment
Documentation

59. SUCCESS CONDITION

The final product should behave like a professional WhatsApp SaaS platform:

Platform Owner
      │
      │ owns Meta Developer App
      ▼
┌───────────────────────────┐
│       WhatsApp SaaS       │
└─────────────┬─────────────┘
              │
       Embedded Signup
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
 Client A  Client B  Client C
     │        │        │
    WABA     WABA     WABA
     │        │        │
 Numbers   Numbers   Numbers
     │        │        │
     └────────┼────────┘
              ▼
        Your Platform
              │
       API / Inbox /
   Campaigns / Templates /
       Analytics / Billing

The platform owner should be able to onboard many independent customers through the same Meta application while maintaining strict tenant isolation and allowing each customer to manage their own WhatsApp Business assets.

don't use lovable cloud

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cb8bf72c-b925-4b91-bf4e-efb62163136f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
