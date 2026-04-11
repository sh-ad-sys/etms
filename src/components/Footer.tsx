"use client";

import "@/styles/footer.css";

export default function Footer({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <footer className={`etms-footer ${collapsed ? "footer-collapsed" : "footer-expanded"}`}>
      <div className="footer-left">© 2026 Royal Mabati Factory</div>

      <div className="footer-center">ETMS v1.0</div>

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
