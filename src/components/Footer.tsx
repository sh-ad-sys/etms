// src/components/Footer.tsx
"use client";

import "@/styles/footer.css";

export default function Footer() {
  return (
    <footer className="etms-footer">
      <div className="footer-left">
        © 2026 Royal Mabati Factory
      </div>

      <div className="footer-center">
        ETMS v1.0
      </div>

      <div className="footer-right">
        <a href="#">Support</a>
        <span>•</span>
        <a href="#">Privacy Policy</a>
        <span>•</span>
        <a href="#">Terms of Use</a>
      </div>
    </footer>
  );
}
