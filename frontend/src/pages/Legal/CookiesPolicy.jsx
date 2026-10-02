import React from 'react';

export default function CookiesPolicy() {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '10px', color: '#1a202c', fontWeight: '800' }}>Cookies Policy</h1>
        <hr></hr>
        <div className="legal-content">
          <p>■ Cookies Policy How TryScan uses cookies and tracking technologies Platform: TryScan — Smart QR Restaurant Ordering System Contact: legal@tryscan.in Applies To: All users of TryScan — Hotel Owners, Staff, and Customers Related Documents: See also: Privacy Policy, Terms &amp; Conditions This policy explains what cookies we use, why we use them, and how you can control them. Essential cookies cannot be disabled as they are required for the Service to function. Effective: 27 April 2025</p>

          <h3> What Are Cookies?</h3>
          <p>Cookies are small text files placed on your device when you visit a website or web application. They are widely used to make websites work, provide personalised experiences, and give operators usage information. TryScan also uses localStorage and sessionStorage — browser-based storage technologies that function similarly. This policy covers all such technologies.</p>
          <h3> How TryScan Uses Cookies</h3>
          <p> Hotel Owners and Staff (Dashboard): Authentication session management, role-based access, security tokens, and user preferences  Customers (QR Menu Page): Cart state, table session tracking, previous order recall, language and dietary preferences  All Users: Platform analytics, performance monitoring, and security</p>
          <h3> Cookie Inventory</h3>
          <p>Cookie / Key Category Purpose Duration tryscan_auth_token Essential Stores, JWT authentication token: to keep you logged in 7 days, tryscan_role: Essential Remembers your role (owner/chef/waiter) for correct dashboard view 7 days, tryscan_hotel_id: Essential Identifies which hotel account you belong to 7 days, tt_session Essential: Manages current browser session for security Session, tt_table_id Essential: Customer QR session — stores scanned table number for orders 2 hours, tt_cart: Functional Stores cart items in localStorage so they persist on refresh 24 hours, tt_last_order: Functional Stores last order for 'Repeat Order' feature 30 days. tt_lang: Functional Remembers preferred menu language 1 year, tt_diet_filter: Functional Remembers veg/non-veg filter preference 30 days. tt_analytics: Analytics Anonymous usage analytics — page views, clicks, feature usage. No personal data. 90 days, tt_perf: Analytics Performance monitoring — page load times and error rates 30 days, _ga / _gid Analytics: Google Analytics — anonymised usage patterns (if enabled) 2 yrs / 24 hrs</p>
          <h3> Cookie Categories Explained</h3>
          <p>Effective: 27 April 2025 Category Description Essential / Strictly Necessary Required for core Service functionality — login, order placement, dashboard access. Cannot be disabled. No consent required. Functional / Preference Enhance experience by remembering choices (cart, language, filters). Not strictly required but improve usability significantly. Analytics / Performance Help us understand usage to improve the platform. Data is anonymised. Require consent where applicable. Third-Party Set by external services (Google Analytics, Razorpay). Subject to those providers' own cookie policies.</p>
          <h3> localStorage and sessionStorage</h3>
          <p> localStorage: Persists data across browser sessions on the same device. Used for cart data, last order recall, and preferences. Stored only on your device — not sent to our servers unless you act (e.g., place an order).  sessionStorage: Stored only for the duration of a single browser tab. Cleared when you close the tab. Used for temporary QR session state. Clear both at any time through browser DevTools or browser settings. Clearing resets your cart and preferences.</p>
          <h3> Third-Party Cookies</h3>
          <p> Google Analytics: If enabled, collects anonymised navigation data. Google's privacy policy applies: policies.google.com/privacy  Razorpay / Payment Gateway: Sets essential security cookies during payment processing. Required for transaction security.  Cloudinary: May set technical cookies for image delivery optimisation when you view menu photos. We do not control third-party cookies. Review their respective privacy and cookie policies for details.</p>
          <h3> Managing Your Cookie Preferences</h3>
          <h3> Cookie Consent Banner</h3>
          <p>On your first visit to the TryScan customer menu page, a consent banner lets you choose: Accept All, Essential Only, or Customise. Essential cookies are always active.</p>
          <h3> Browser Settings</h3>
          <p>Browser Where to Manage Cookies Google Chrome Settings → Privacy and Security → Cookies and other site data Mozilla Firefox Settings → Privacy &amp; Security → Cookies and Site Data Safari (iOS/macOS) Settings → Safari → Privacy &amp; Security Microsoft Edge Settings → Cookies and site permissions → Manage and delete cookies Samsung Internet Settings → Privacy → Cookie settings</p>
          <h3> Opt-Out of Analytics</h3>
          <p>Effective: 27 April 2025 Opt out of Google Analytics across all websites using the official browser add-on: tools.google.com/dlpage/gaoptout</p>
          <h3> Do Not Track (DNT)</h3>
          <p>Some browsers send a DNT signal. There is currently no universal standard for responding to DNT. TryScan does not currently respond to DNT signals — use the controls in Section 3.7 to manage tracking.</p>
          <h3> Changes to This Cookies Policy</h3>
          <p>We may update this policy as our use of cookies or applicable law changes. Material changes will be communicated via the consent banner and, for registered owners, via email.</p>
          <hr></hr>
          <p style={{ textAlign: 'center', marginTop: '16px', color: '#718096', marginBottom: '40px', fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>©2026 TryScan. All rights reserved. Last updated: April 30, 2026</p>
        </div>
      </div>
    </div>
  );
}
