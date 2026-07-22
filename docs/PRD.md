# RCC Commerce Platform PRD (Claude Code Optimized)

> Version: 2.0
> Architecture: API-First • Event-Driven • Modular
> Applications:
> - Main Website → https://racquetsclubcommunity.com
> - Storefront → https://store.racquetsclubcommunity.com
> - Admin Portal → https://admin.racquetsclubcommunity.com

---

# 1. Project Goal

Build a premium community-first commerce ecosystem that powers all RCC merchandise, memberships, rewards, subscriptions, tournament merchandise and personalization from a single backend.

The platform should behave as **one unified system**, not three independent websites.

All applications must remain synchronized in real-time.

---

# 2. System Architecture

```
                       Users
                         │
         ───────────────────────────────────

              racquetsclubcommunity.com
              (Marketing Website)

                         │
                 Product API
                 Collection API
                 Membership API
                 Rewards API
                 CMS API
                         │

         ───────────────────────────────────

             API Gateway / Backend

         Authentication Service
         Product Service
         Inventory Service
         Pricing Service
         Membership Service
         Rewards Service
         Cart Service
         Order Service
         Payment Service
         Shipping Service
         Notification Service
         Analytics Service
         Subscription Service
         Media Service

         Event Bus / Queue
         Webhooks
         Cache

         PostgreSQL
         Redis
         Object Storage

         ───────────────────────────────────

Storefront                      Admin Portal
store.rcc                       admin.rcc
```

Everything should communicate through APIs.

Never duplicate business logic.

---

# 3. Core Principle

There must only be ONE source of truth.

Products

↓

Created once

↓

Available everywhere

↓

Updated once

↓

Updated everywhere

---

Inventory

↓

Updated by Admin

↓

Instantly updates

- Storefront
- Website
- Checkout
- Analytics

---

Membership

↓

Updated once

↓

Pricing updates

↓

Rewards update

↓

Store permissions update

↓

Website badges update

---

# 4. Synchronization Rules

Every module must publish events.

Example

Product Updated

↓

Event Bus

↓

Storefront refreshes cache

↓

Website refreshes showcase

↓

Search Index updates

↓

Analytics updates

↓

Recommendation Engine refreshes

---

Inventory Changed

↓

Storefront Stock

↓

Product Pages

↓

Bundle Availability

↓

Limited Edition Counter

↓

Checkout Validation

↓

Admin Analytics

---

Order Completed

↓

Rewards

↓

Member Stats

↓

Inventory

↓

Sales Analytics

↓

Subscription Engine

↓

Community Achievements

↓

Email

↓

WhatsApp

↓

Invoice

---

Customer Created

↓

CRM

↓

Marketing

↓

Rewards

↓

Membership

↓

Analytics

↓

Referral Engine

---

Never manually sync data.

Everything must be event-driven.

---

# 5. Shared Services

Every application consumes the same APIs.

---

Authentication Service

Responsible for

- Login
- Signup
- JWT
- Refresh Tokens
- Google Login
- OTP
- Session Management

Consumed by

- Website
- Store
- Admin

---

Membership Service

Responsible for

- Membership Status
- Elite Status
- Chapters
- Founding Members
- Membership Expiry
- Member Pricing
- Access Permissions

Consumed by

- Website
- Store
- Admin

---

Product Service

Responsible for

Products

Variants

Collections

Images

Videos

Personalization

Pricing

Inventory Reference

Recommendations

Consumed everywhere.

---

Pricing Service

Calculates

MRP

Member Price

Bulk Price

Bundle Price

Tournament Price

Coupon Price

Reward Price

Subscription Price

No pricing logic should exist in frontend.

---

Rewards Service

Responsible for

Points

Achievements

Unlocks

Leaderboards

Referral Rewards

Consumed by

Store

Website

Admin

---

Inventory Service

Tracks

Stock

Reserved Stock

Incoming Stock

Warehouses

Low Inventory

Limited Stock

Consumed by

Store

Website

Checkout

Admin

---

Notification Service

Responsible for

Email

WhatsApp

SMS

Push

Webhooks

---

Analytics Service

Collects

Views

Clicks

Orders

Revenue

Funnels

Products

Subscriptions

Rewards

Membership

Campaigns

---

# 6. API Communication

Every application must communicate through REST APIs.

Never directly access another application's database.

Example

Website

↓

GET

/products

Store

↓

GET

/cart

Admin

↓

PATCH

/products/:id

All applications receive updates through Events.

---

# 7. Product Module

Products support

- Images
- Videos
- 360 View
- Variants
- Colors
- Sizes
- Collections
- Inventory
- SEO
- Metadata
- Reviews
- AI Recommendations

Every product has

Unique UUID

SKU

Slug

Visibility

Status

Publish Date

Tags

Collections

---

# 8. Personalized Jerseys

Supports

Player Name

Nickname

Number

Chapter

Fonts

Colors

Sponsor Logos

Captain Badge

Vice Captain Badge

Tournament Badge

Preview

Version History

Saved Designs

Duplicate

Reorder

Every customization stored separately.

Never overwrite originals.

---

# 9. Live Preview Engine

Preview updates instantly.

Supports

Desktop

Tablet

Mobile

Front

Back

Zoom

Rotate

Generated Preview Image

Preview cached.

---

# 10. Membership Engine

Membership Levels

Guest

Member

Premium

Elite

Founding

Admin

Permissions

Member Pricing

Exclusive Collections

Limited Drops

Reward Multipliers

Priority Checkout

Member Bundles

---

# 11. Rewards Engine

Triggers

Purchase

Referral

Tournament

Attendance

Reviews

Birthday

Renewal

Achievements

Unlocks

Exclusive Products

Exclusive Jerseys

Exclusive Discounts

Tournament Entries

Everything event-driven.

---

# 12. Community Achievement Engine

Tracks

Games Played

Sessions

Attendance

Tournament Wins

Volunteer Hours

Referrals

Achievements unlock

Merch

Coupons

Badges

Profile Titles

---

# 13. Limited Drops

Supports

Countdown

Launch Time

Queue

Stock Counter

Early Access

Members Only

Founders Only

Archive

Notify Me

Waiting List

---

# 14. Team Ordering

CSV Upload

Bulk Personalization

Shared Checkout

Invoice

GST

Approval Workflow

Bulk Discounts

Manager Dashboard

---

# 15. Bundle Engine

Supports

Static Bundles

Dynamic Bundles

Mix & Match

Volume Discounts

Auto Discounts

Bundle Inventory

Bundle Analytics

---

# 16. Subscription Engine

Recurring Products

Monthly

Quarterly

Yearly

Supports

Pause

Resume

Cancel

Upgrade

Downgrade

Retry Payments

Automatic Rewards

Subscription Analytics

---

# 17. Shopping Cart

Persistent

Cross Device

Coupons

Rewards

Gift Cards

Bundles

Saved Cart

Recently Viewed

Recommended Products

---

# 18. Abandoned Cart Automation

Triggers

30 Minutes

↓

Reminder

6 Hours

↓

Email

24 Hours

↓

WhatsApp

48 Hours

↓

Coupon

Analytics

Recovered Revenue

Recovery %

Revenue Lost

---

# 19. Search Engine

Supports

Autocomplete

AI Search

Synonyms

Typo Tolerance

Filters

Collections

Recommendations

Trending

Recent Searches

---

# 20. Marketing Automation

Flows

Welcome

Birthday

Festival

Membership Renewal

Referral

Reward Expiry

Abandoned Cart

Back in Stock

Price Drop

Drop Launch

Inactive Customer

VIP Campaigns

---

# 21. Admin Portal

Single control center.

Modules

Dashboard

Products

Orders

Customers

Inventory

Pricing

Rewards

Membership

Subscriptions

Collections

Content

Coupons

Marketing

Analytics

Returns

Support

System Settings

Permissions

Audit Logs

---

# 22. Analytics

Track

Revenue

Orders

AOV

LTV

CAC

Conversion

Drop Performance

Member Revenue

Subscription Revenue

Reward Usage

Referral Revenue

Inventory Turnover

Top Products

Top Customers

Heatmaps

Funnels

---

# 23. Event Bus

Events include

ProductCreated

ProductUpdated

InventoryChanged

PriceChanged

CollectionPublished

OrderPlaced

OrderPaid

OrderCancelled

RewardEarned

RewardRedeemed

MembershipUpdated

SubscriptionCreated

SubscriptionCancelled

CustomerCreated

CustomerUpdated

ReviewCreated

GalleryApproved

Every service subscribes only to required events.

---

# 24. Cache Strategy

Redis

Cache

Products

Collections

Pricing

Membership

Recommendations

Invalidate cache automatically after update events.

---

# 25. Media Service

Handles

Images

Videos

360 Assets

Preview Images

Generated Jersey Previews

CDN

Optimization

Lazy Loading

---

# 26. Security

JWT

RBAC

Admin Roles

Rate Limiting

CSRF

XSS Protection

Audit Logs

Encrypted Payments

Secure File Upload

---

# 27. Performance Targets

Homepage

<1.5s

Store Pages

<2s

Product Page

<2s

Checkout

<2s

API Response

<300ms

Image Optimization

WebP

Lazy Loading

Server Side Rendering

Caching

---

# 28. Future Integrations

Hudle

WhatsApp

Razorpay

Shiprocket

Google Analytics

Meta Pixel

Google Merchant

Resend

Firebase

Supabase Auth

OpenAI

Claude

---

# 29. Future AI Modules

AI Jersey Designer

AI Size Prediction

AI Product Recommendations

AI Support Agent

AI Marketing Assistant

AI Inventory Forecasting

AI Demand Prediction

AI Fraud Detection

AI Review Summaries

---

# 30. Development Rules (Critical)

Claude Code should follow these rules throughout the project:

### Architecture
- Feature-first modular architecture.
- Shared TypeScript types across all apps.
- No duplicated business logic.
- All mutations go through backend APIs.
- Frontend remains presentation-only.

### Data Flow
- APIs are the single source of truth.
- All state changes emit domain events.
- Services react to events instead of polling.
- Use optimistic UI with automatic rollback on failures.

### Shared Contracts
- Maintain a shared schema package for:
  - API request/response types
  - Product models
  - Membership models
  - Reward models
  - Order models
  - Event payloads

### Inter-Application Sync
Any change in Admin must automatically propagate to:
1. Storefront
2. Main Website
3. Search Index
4. Analytics
5. Recommendation Engine
6. Notification Service (if applicable)

No manual synchronization should ever be required.

### Extensibility
Every major feature (Rewards, Memberships, Bundles, Subscriptions, Personalization, Team Orders) must be implemented as an independent module with well-defined APIs so it can evolve without affecting other modules.

### Code Quality
- Strong typing throughout.
- Repository/service pattern where appropriate.
- Comprehensive logging.
- Idempotent event handlers.
- Backward-compatible APIs when possible.
- Feature flags for experimental functionality.
- Automated tests for critical business flows.
