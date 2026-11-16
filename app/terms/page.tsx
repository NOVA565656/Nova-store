export default function TermsOfService() {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using our marketplace, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>
      
      <h2>2. User Responsibilities</h2>
      <p>You are solely responsible for the products and skills you list. We utilize AI to scan for prohibited items, but we do not guarantee the accuracy, safety, or legality of any listing.</p>
      
      <h2>3. No Payments</h2>
      <p>We are a connection platform. We do not process payments. All transactions are handled directly between the buyer and seller.</p>
      
      <h2>4. Termination</h2>
      <p>We reserve the right to suspend or terminate your account if you violate these terms or attempt to abuse our systems (including rate limits and APIs).</p>
    </main>
  );
}