export default function PrivacyPolicy() {
  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, list a product, or communicate with other users. This includes your name, email address, and any Facebook Page tokens you choose to connect.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use your information to operate the marketplace, facilitate communication between buyers and sellers, and publish listings to Facebook Pages (with your explicit permission).</p>

      <h2>3. Facebook Data Deletion</h2>
      <p>You can request the deletion of your data at any time by removing our app from your Facebook settings. We will automatically receive a deauthorization callback and wipe your stored Facebook tokens from our database.</p>
      
      <h2>4. Contact Us</h2>
      <p>If you have questions about this policy, contact us at support@yourdomain.com.</p>
    </main>
  );
}