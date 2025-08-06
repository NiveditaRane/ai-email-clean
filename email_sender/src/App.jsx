import { useState } from "react";

export default function App() {
  const [recipients, setRecipients] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const generateEmail = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.email) setGeneratedEmail(data.email);
      else setMessage("Failed to get generated email.");
    } catch (err) {
      setMessage("Error generating email.");
    }
    setLoading(false);
  };

  const sendEmail = async () => {
    if (!recipients.trim() || !generatedEmail.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, emailBody: generatedEmail }),
      });
      const data = await res.json();
      setMessage(data.message || "Email sent.");
    } catch (err) {
      setMessage("Error sending email.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h1>AI Email Sender</h1>

      <label>
        Recipients (comma separated):
        <input
          type="text"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 5, marginBottom: 15 }}
          placeholder="e.g. example1@mail.com, example2@mail.com"
        />
      </label>

      <label>
        Email prompt:
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 5 }}
          placeholder="Write a professional email asking for a meeting."
        />
      </label>

      <button onClick={generateEmail} disabled={loading || !prompt.trim()} style={{ marginTop: 10 }}>
        {loading ? "Generating..." : "Generate Email"}
      </button>

      <label style={{ display: "block", marginTop: 20 }}>
        Generated email (editable):
        <textarea
          rows={10}
          value={generatedEmail}
          onChange={(e) => setGeneratedEmail(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 5 }}
          placeholder="Generated email will appear here..."
        />
      </label>

      <button
        onClick={sendEmail}
        disabled={loading || !recipients.trim() || !generatedEmail.trim()}
        style={{ marginTop: 10 }}
      >
        {loading ? "Sending..." : "Send Email"}
      </button>

      {message && <p style={{ marginTop: 15, color: "green" }}>{message}</p>}
    </div>
  );
}
