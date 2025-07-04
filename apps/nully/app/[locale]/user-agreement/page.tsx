export default function UserAgreementPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="prose prose-lg max-w-4xl mx-auto">
        <h1>User Agreement for Nully.eu</h1>
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-CA')}
        </p>

        <h2>1. The Nully.eu Service</h2>
        <p>
          Welcome to Nully.eu. This User Agreement ("Agreement") governs your use of our peer-to-peer (P2P) file transfer service. Nully.eu acts as a neutral communication tool that facilitates direct, end-to-end encrypted transfers between users. By using the service, you agree to be bound by these terms.
        </p>

        <h2>2. Your Responsibilities and Acceptable Use</h2>
        <p>
          You are solely responsible for the content you transfer using Nully.eu. You agree to use the service in compliance with all applicable laws, including copyright and intellectual property laws. You agree not to use Nully.eu to transfer any content that is:
        </p>
        <ul>
          <li>Illegal, such as child exploitation material or incitement to violence.</li>
          <li>Infringing on the intellectual property rights of others.</li>
          <li>Malicious, such as viruses, malware, or spyware.</li>
        </ul>

        <h2>3. Our Role as an Intermediary (Digital Services Act)</h2>
        <p>
          Nully.eu operates as an "intermediary service" under the EU's Digital Services Act (DSA). In accordance with our legal obligations and "safe harbor" protections, we want to be clear about our role:
        </p>
        <ul>
          <li>
            <strong>We Do Not Monitor Your Files:</strong> We have no technical means or legal obligation to monitor the content you transfer. Your files remain private and are end-to-end encrypted.
          </li>
          <li>
            <strong>Disclaimer of Liability:</strong> As a neutral conduit, we are not liable for the content transferred by users. The responsibility rests entirely with the user who sends the content.
          </li>
        </ul>

        <h2>4. Reporting Abuse and Enforcement</h2>
        <p>
          While we do not monitor content, we are committed to acting on valid notices of illegal content. If you believe someone is using Nully.eu to share illegal material, please report it immediately to <a href="mailto:abuse@nully.eu">abuse@nully.eu</a>.
        </p>
        <p>
          Upon receiving a valid and sufficiently precise notice, we reserve the right to take action, which may include disabling the specific transfer link or blocking the involved peer from using our signaling server, to prevent further distribution of the illegal content via our service.
        </p>

        <h2>5. Disclaimer of Warranty & Limitation of Liability</h2>
        <p>
          The service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties. In no event shall Nully.eu, its creators, or affiliates be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service.
        </p>
      </div>
    </main>
  );
}