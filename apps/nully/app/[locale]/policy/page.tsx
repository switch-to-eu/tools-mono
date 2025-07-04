export default function PolicyPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="prose prose-lg max-w-4xl mx-auto">
        <h1>Privacy Policy for Nully.eu</h1>
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-CA')}
        </p>

        <h2>Our Commitment to Your Privacy</h2>
        <p>
          Welcome to Nully.eu. We are committed to protecting your privacy and handling your data in an open and transparent manner. Nully is a peer-to-peer (P2P) file transfer service, which means your files are sent directly from your device to the recipient's device without passing through our servers. This policy explains what information is handled to make this possible and your rights under EU law.
        </p>

        <h2>What Information We Handle (and What We Don't)</h2>
        <p>
          Our guiding principle is <strong>data minimization</strong>. We only process data that is strictly necessary for the service to function.
        </p>
        <ul>
          <li>
            <strong>Your Files:</strong> We <strong>never</strong> see, store, or have access to the files you transfer. All transfers are encrypted and sent directly between you and the other user (end-to-end encryption via WebRTC's DTLS and SRTP protocols).
          </li>
          <li>
            <strong>Personal Information:</strong> We do not require you to create an account or provide any personal information like your name or email address.
          </li>
          <li>
            <strong>IP Addresses:</strong> Your IP address may be used ephemerally by the signaling server to help establish the direct P2P connection. We do not log or store your IP address.
          </li>
        </ul>

        <h2>The Role of Our Signaling Server</h2>
        <p>
          To initiate a P2P connection, your browser needs to find the recipient's browser. We use a <strong>signaling server</strong> (PeerJS broker) located in the EU for this purpose. This server acts as a temporary "matchmaker":
        </p>
        <ul>
          <li>It helps exchange the necessary technical information (like peer IDs and network details) so a direct connection can be formed.</li>
          <li>Once the connection is established, the signaling server is no longer involved. All subsequent communication, including file transfer, is direct between peers.</li>
          <li>The signaling server logs are minimal and are not used for tracking.</li>
        </ul>

        <h2>Cookies and Local Storage (ePrivacy)</h2>
        <p>
          To provide a functional service, we use your browser's <code>localStorage</code> for one specific purpose: to remember that you have accepted our Policy and User Agreement. This is strictly necessary to avoid showing you the consent form on every visit.
        </p>
        <p>
          We <strong>do not use tracking cookies</strong> or any third-party analytics services that profile users.
        </p>

        <h2>User Responsibility and Content (DSA)</h2>
        <p>
          As a user, you are solely responsible for the files and content you transfer using Nully.eu. You agree not to use our service for any illegal activities, including but not limited to sharing copyrighted material without permission, malware, or other illicit content.
        </p>
        <p>
          Nully.eu operates as a neutral "mere conduit" under the EU's Digital Services Act (DSA). We do not monitor the content of your transfers. However, we provide a mechanism for reporting illegal content. To report abuse, please contact us at <a href="mailto:abuse@nully.eu">abuse@nully.eu</a>. Upon receiving a valid notice, we may take action to prevent the offending link or user from using our service again.
        </p>

        <h2>Your Rights Under GDPR</h2>
        <p>
          The EU General Data Protection Regulation (GDPR) gives you rights over your personal data. Since we do not store any personal data, exercising rights such as access or deletion is generally not applicable. However, if you have any questions or concerns about how your data is handled, you have the right to contact us.
        </p>

        <h2>Security Measures</h2>
        <p>
          We take security seriously. All communications with our website and signaling server are encrypted using HTTPS and WSS (Secure WebSockets). As mentioned, your file transfers are end-to-end encrypted by default within the WebRTC protocol.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@nully.eu">privacy@nully.eu</a>.
        </p>
      </div>
    </main>
  );
}