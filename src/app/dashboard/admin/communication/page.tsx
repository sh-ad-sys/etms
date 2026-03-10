"use client";

import "@/styles/admin-communication.css";
import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface GatewayStatus {
  name: string;
  type: "Email" | "SMS";
  status: "Active" | "Inactive" | "Error";
  provider: string;
}

export default function CommunicationPage() {

  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const [alert, setAlert] = useState("");

  const [selectedGateway, setSelectedGateway] = useState<GatewayStatus | null>(null);

  const [gateways] = useState<GatewayStatus[]>([
    {
      name: "SMTP Email Gateway",
      type: "Email",
      status: "Active",
      provider: "SendGrid"
    },
    {
      name: "SMS Gateway",
      type: "SMS",
      status: "Active",
      provider: "Twilio"
    }
  ]);

  /* ================= SEND MESSAGE ================= */

  const sendTestMessage = () => {

    if (!recipient.trim()) {
      setAlert("Recipient cannot be empty");
      return;
    }

    if (!message.trim()) {
      setAlert("Message cannot be empty");
      return;
    }

    setAlert("✅ Message sent successfully!");
    setTimeout(() => setAlert(""), 3000);

    setMessage("");
    setRecipient("");
  };

  return (
    <div className="comm-container">

      <div className="comm-header">
        <h1>
          <Mail size={28}/>
          Communication Gateways
        </h1>
        <p>Email & SMS Enterprise Messaging Control</p>
      </div>

      {/* ALERT */}
      {alert && (
        <div className="comm-alert">
          {alert}
        </div>
      )}

      {/* GATEWAYS */}
      <div className="gateway-grid">

        {gateways.map((gateway, index) => (
          <div key={index} className="gateway-card">

            <div className="gateway-title">
              {gateway.type === "Email"
                ? <Mail size={22}/>
                : <MessageSquare size={22}/>
              }

              <div>
                <h3>{gateway.name}</h3>
                <span>{gateway.provider}</span>
              </div>
            </div>

            <div className={`gateway-status ${gateway.status.toLowerCase()}`}>
              {gateway.status === "Active" && <CheckCircle size={14}/>}
              {gateway.status === "Error" && <AlertTriangle size={14}/>}
              {gateway.status}
            </div>

            <button
              className="gateway-btn"
              onClick={() => setSelectedGateway(gateway)}
            >
              <Settings size={16}/>
              Configure
            </button>

          </div>
        ))}

      </div>

      {/* MESSAGE FORM */}
      <div className="comm-card">

        <h2>Send Test Message</h2>

        <div className="comm-form">

          <input
            placeholder="Recipient Email / Phone"
            value={recipient}
            onChange={(e)=>setRecipient(e.target.value)}
          />

          <textarea
            placeholder="Message content..."
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
          />

          <button
            className="send-btn"
            onClick={sendTestMessage}
          >
            <Send size={16}/>
            Send Test Message
          </button>

        </div>

      </div>

      {/* CONFIGURATION MODAL */}
      {selectedGateway && (
        <div className="modal-overlay">

          <div className="modal">

            <h3>{selectedGateway.name} Configuration</h3>

            <p className="modal-sub">
              Provider: {selectedGateway.provider}
            </p>

            <label>API Key</label>
            <input placeholder="Enter API key" />

            <label>Endpoint URL</label>
            <input placeholder="Gateway endpoint" />

            <div className="modal-actions">

              <button
                onClick={() => setSelectedGateway(null)}
              >
                Cancel
              </button>

              <button className="primary-btn">
                Save Configuration
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}