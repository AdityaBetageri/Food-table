import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page-wrapper">
      <div className="legal-page-container">
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '10px', color: '#1a202c', fontWeight: '800' }}>Privacy Policy</h1>
        <hr></hr>


        <div className="legal-content">
          <p>■ Privacy Policy How we collect, use, store &amp; protect your personal data Platform: TableTap — Smart QR Restaurant Ordering System Data Controller: TableTap, Mangaluru, Karnataka, India DPO / Contact: legal@tabletap.in Grievance Officer: grievance@tabletap.in Governing Law: IT Act 2000, IT Rules 2011, DPDPA 2023 (India) This Privacy Policy explains how we collect and handle your personal data. We are committed to protecting your privacy and complying with Indian data protection law. Effective: 27 April 2025</p>
          <h3> Privacy Policy</h3>
          <h3> Introduction</h3>
          <p>TableTap ('we', 'us') is committed to protecting the privacy of all platform users. This policy applies to Hotel Owners, Restaurant Staff, and Customers (Guest Users) and is published in compliance with the Information Technology Act, 2000, the IT (SPDI) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (DPDPA).</p>
          <h3> Data We Collect</h3>
          <h3> From Hotel Owners and Staff</h3>
          <p> Account Information: Name, business name, email, phone number, city, and bcrypt-hashed password  Business Information: Restaurant address, operating hours, cuisine type, FSSAI number (if provided), logo and images  Payment Information: Subscription/billing history. We do NOT store card numbers — handled by third-party gateways  Usage Data: Dashboard activity, menu changes, login timestamps, and IP addresses  Communications: Emails, support tickets, and feedback submitted to us</p>
          <h3> From Customers (QR / Guest Users)</h3>
          <p> No Registration Required: Customers are not required to create an account  Session Data: Table number (from QR URL), cart items, orders placed — linked to a temporary session ID  Device Data: Browser type, OS, device type, screen resolution  Feedback: Star rating and optional comment after an order  Payment Reference: Transaction ID only (if online payment is used). Card/UPI details never stored by TableTap  Contact Info (optional): Phone number, only if voluntarily provided for WhatsApp bill or reservation</p>
          <h3> Automatically Collected</h3>
          <p> Log Data: Server logs including IP address, request type, URL, and timestamps  Cookies &amp; Local Storage: See the Cookies Policy document for full details  Analytics: Aggregated, anonymised usage statistics to improve the platform</p>
          <h3> How We Use Your Data</h3>
          <p>Purpose Data Used Account creation and authentication Name, email, password hash, phone Providing dashboard and management tools Account info, business info, usage data Processing and displaying customer orders Table number, items ordered, session ID Effective: 27 April 2025 Real-time order communication (Socket.io) Order data, table number, status updates Generating bills and receipts Order items, quantities, prices, payment status Sales analytics and reports Order history, revenue data (aggregated) Customer support and communications Email, support content Platform security and fraud prevention IP address, login activity, device data Improving the Service Anonymised usage patterns Legal compliance Any data required by applicable law</p>
          <h3> Legal Basis for Processing</h3>
          <p> Contractual Necessity: Processing required to deliver the Service (e.g., managing your account, processing orders)  Consent: Where you have given explicit consent (e.g., marketing emails, optional analytics)  Legitimate Interests: Security monitoring, fraud prevention — where not overridden by your rights  Legal Obligation: Compliance with applicable Indian laws (e.g., tax records)</p>
          <h3> Data Sharing</h3>
          <p>We do NOT sell, rent, or trade your personal data. We share data only in these circumstances:  Within Hotel Account: Order data shared between Owner, Chef, Waiter, Cashier roles — core Service functionality  Service Providers: Cloud hosting (Render/Vercel), database (MongoDB Atlas), image storage (Cloudinary), email and payment gateways — all bound by data protection agreements  Legal Requirements: If required by law, court order, or government authority  Business Transfers: If TableTap is acquired or merged, data may transfer subject to equivalent privacy protections  Aggregated Data: Non-personally identifiable statistics may be shared for business purposes</p>
          <h3> Data Retention</h3>
          <p>Data Type: Retention Period, Active hotel account data: Duration of the account, Order records: 3 years (tax/legal compliance). Customer session data (guest): 30 days after session ends, Analytics data (anonymised): Up to 5 years, Security and access logs: 12 months, Deleted account data: 90 days, then permanently purged Effective: 27 April 2025, Legal hold data: As required by law or court order</p>
          <h3> Data Security</h3>
          <p> Encryption in Transit: All data encrypted using TLS 1.2+ (HTTPS)  Password Security: Passwords hashed with bcrypt (salt factor 12) — never stored in plain text  Authentication: JWT-based auth with short expiry and role-based access control  Access Controls: Data access restricted to authorised personnel on a need-to-know basis  Infrastructure: Hosting providers maintain SOC 2 compliance and regular security audits  Vulnerability Management: Regular security reviews and prompt patching of known vulnerabilities No internet transmission is 100% secure. We encourage strong passwords and safe account practices.</p>
          <h3> Your Rights (DPDPA 2023)</h3>
          <p> Right to Access: Request a copy of personal data we hold about you  Right to Correction: Request correction of inaccurate or incomplete data  Right to Erasure: Request deletion, subject to legal retention requirements  Right to Grievance Redressal: Lodge a complaint with our Grievance Officer at grievance@tabletap.in — response within 30 days  Right to Withdraw Consent: Withdraw consent for optional processing at any time  Right to Data Portability: Request your account data in JSON or CSV format To exercise any right, email legal@tabletap.in with your account email and request description. We respond within 30 days.</p>
          <h3> Children's Privacy</h3>
          <p>TableTap does not knowingly collect personal data from children under 18. Our platform is intended for adults. If we discover minor's data has been collected, we will delete it promptly. Contact legal@tabletap.in if you have concerns.</p>
          <h3> International Data Transfers</h3>
          <p>Data is primarily stored and processed in India. Where we use providers outside India, we ensure appropriate safeguards including contractual clauses requiring data protection to Indian law standards.</p>
          <h3> Changes to This Policy</h3>
          <p>We may update this Privacy Policy periodically. Material changes will be communicated via email to hotel owners and in-dashboard notices. The effective date at the top indicates the last revision. Privacy concerns? Data requests: legal@tabletap.in | Grievances: grievance@tabletap.in |</p>
          <hr></hr>
          <p style={{ textAlign: 'center', color: '#718096', marginTop: '16px', marginBottom: '40px', fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>©2026 TableTap. All rights reserved. Last updated: April 30, 2026</p>
        </div>
      </div>
    </div>
  );
}
