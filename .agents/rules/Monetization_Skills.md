# Skill: Product Strategy & Monetization Lead

## Role
You are an expert Product Manager and Growth Strategist focusing on app monetization, user retention, and SaaS economics. Your goal is to design a sustainable revenue model for FreshScan AI that offsets API costs while delivering immense value to consumers.

## Core Monetization Strategy: The Freemium Model
The primary revenue model will be a structured Freemium approach. This limits Gemini API costs for free users while providing highly compelling features to drive "Pro" conversions.

### 1. Free Tier (Guest & Basic Authenticated)
*   **Quota Limits (Firebase Remote Config):** Implement a daily scan limit (Default: 5 free scans per day). Note: Scans that return a `NOT_FOOD` classification DO NOT count toward this limit to ensure fair usage.
*   **Virtual Fridge Limit (Firebase Remote Config):** Free users can try out the Virtual Fridge, but are hard-capped to a maximum of 1 item (Default: 1).
*   **Usage Tracking:** 
    *   *Guests:* Track daily usage (`scan_count`) via `localStorage`.
    *   *Logged-in Users:* Track usage inside a Firestore user document.

### 2. Pro Tier (FreshScan+)
*   **Subscription:** A recurring monthly/yearly subscription (e.g., $2.99/month or $24.99/year) processed via Stripe Checkout or RevenueCat.
*   **Perks:**
    *   Unlimited AI scans.
    *   Zero ads (if implemented).
    *   Unlimited capacity in the "Virtual Fridge" and smart notifications.

## Premium Feature Highlight: The "Virtual Fridge"
The major selling point for upgrading to the Pro Tier is the **Virtual Fridge**—a feature designed to actively save the user money by preventing food waste (easily justifying the subscription cost).

### Concept & Mechanics
1.  **Inventory Management:** When a Pro user scans a fresh item, they have the option to tap "Add to Virtual Fridge".
2.  **Expiration Prediction (Smart Default + Toggle):** The Vision AI prompt will be expanded to return a multi-environment shelf-life matrix (days in Pantry, Fridge, Freezer) and a `recommended_storage` default. When added to the Fridge, it defaults to the recommended setting (zero friction). The user can tap a toggle later to change the environment, dynamically updating the expiration date on the fly.
3.  **Proactive Notifications:** The PWA (via Service Workers and Firebase Cloud Messaging) will send proactive alerts: *"Your Salmon Fillet is expiring tomorrow! Cook it soon."*
4.  **Recipe Generation (Upsell):** The app can query an LLM or recipe API to suggest meals based specifically on the ingredients that are about to expire in the user's Virtual Fridge.

## Implementation Roadmap (Phase 5)
1.  **Firebase Remote Config:** Integrate Remote Config to fetch `free_daily_scans` (default: 5) and `free_fridge_limit` (default: 1) so these numbers can be tweaked from the Firebase Console without an app update.
2.  **Database Expansion:** Update Firestore to track User Subscription status, remaining daily quotas, and reset timestamps.
3.  **Paywall UI:** Build a sleek, conversion-optimized pricing modal that triggers when a free user hits their daily limit or tries to add a 2nd item to the Virtual Fridge.
4.  **Virtual Fridge UI:** Design a new dashboard view showing current inventory, sorted chronologically by expiration date (color-coded).
5.  **Stripe Integration:** Implement the Stripe Node.js SDK and webhook handlers to manage subscription lifecycles.
