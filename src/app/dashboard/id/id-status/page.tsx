"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from '../../../../styles/id-status.module.css';

type Status = "Active" | "Lost" | "Suspended" | "Revoked" | "Pending";
type StatusEntry = { id: string; status: Status; date: string; note?: string };

function badgeClass(status: Status) {
  switch (status) {
    case "Active": return styles.badgeActive;
    case "Lost": return styles.badgeLost;
    case "Suspended": return styles.badgeSuspended;
    case "Revoked": return styles.badgeRevoked;
    case "Pending": return styles.badgePending;
    default: return styles.badgeActive;
  }
}

export default function IDStatusPage() {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<StatusEntry | null>(null);
  const [history, setHistory] = useState<StatusEntry[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hrApproved, setHrApproved] = useState(false);

 /* ================= FETCH REAL STATUS ================= */

useEffect(() => {

  const fetchStatus = async () => {

    try {

      const res = await fetch(
        "http://localhost/etms/controllers/id/id-status.php",
        {
          credentials: "include"
        }
      );

      const data = await res.json();

      setCurrent(data.current);
      setHistory(data.history || []);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);

  };

  fetchStatus();

}, []);

  useEffect(() => {
    // detect any HR approval note in history
    if (history.some((h) => /approved by hr/i.test(h.note || ''))) setHrApproved(true);
    else setHrApproved(false);
  }, [history]);

  const handleRequestReplacement = async () => {

  setConfirmOpen(false);
  setRequesting(true);

  try {

    const res = await fetch(
      "http://localhost/etms/controllers/id/request-replacement.php",
      {
        method: "POST",
        credentials: "include"
      }
    );

    const data = await res.json();

    if (!data.success) throw new Error(data.error);

    setToast("Replacement request submitted");

    // Refresh status after request
    setTimeout(() => {
      window.location.reload();
    }, 1200);

  } catch (err) {
    console.error(err);
    setToast("Failed to submit request");
  }

  setRequesting(false);
};
  if (loading) return <div className={styles.page}><div className={styles.loader}>Loading status…</div></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>ID status</h1>
          <p className={styles.lead}>Your staff identity card status and history.</p>
        </div>
        <div className={styles.avatarWrap}>
          <Image src="/avatar-placeholder.png" alt="avatar" width={48} height={48} className={styles.avatar} />
        </div>
      </header>

      <main className={styles.grid}>
        <section className={styles.card} aria-labelledby="current-status">
          <div className={styles.currentRow}>
            <div>
              <div className={styles.cardTitle}>Current status</div>
              <div className={styles.statusRow}>
                <div className={`${styles.badge} ${badgeClass(current?.status ?? 'Active')}`}>{current?.status}</div>
                <div className={styles.meta}>{current?.date}</div>
              </div>
              {current?.note && <div className={styles.note}>{current.note}</div>}
            </div>

            <div className={styles.actions}>
              <button className={styles.primary} onClick={() => setConfirmOpen(true)} disabled={requesting}>Request replacement</button>
              <button className={styles.ghost} onClick={() => setToast('Help: contact security at ext. 123')}>Help</button>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Recent activity</h3>
            <ul className={styles.historyList}>
              {history.map((h) => (
                <li key={h.id} className={styles.historyItem}>
                  <div className={styles.historyLeft}>
                    <div className={styles.historyStatus}><span className={`${styles.badge} ${badgeClass(h.status)}`}>{h.status}</span></div>
                    <div className={styles.historyNote}>{h.note}</div>
                  </div>
                  <div className={styles.historyDate}>{h.date}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Replacement</h3>
            {!hrApproved ? (
              <div className={styles.replacementBox}>
                <div>HR approval is required before you can formally apply for a replacement ID. Track status above; you'll be notified here once approved.</div>
                <div style={{ marginTop: 10 }}>
                  <button className={styles.simButton} onClick={() => {
                    // simulation helper (for demo/dev) — mark HR approved
                    setHistory((s) => [{ id: `H-APP-${Date.now()}`, status: 'Pending', date: new Date().toISOString().slice(0,10), note: 'Approved by HR' }, ...s]);
                    setToast('HR approved (simulated) — you may now apply');
                    setTimeout(() => setToast(null), 3000);
                  }}>Simulate HR approval</button>
                </div>
              </div>
            ) : (
              <div className={styles.applyForm}>
                <p className={styles.muted}>HR has approved your request — complete the application below to issue a new ID.</p>
                <ReplacementForm onApply={async (data) => {
                  // simulate apply
                  const entry = { id: `APP-${Date.now()}`, status: 'Pending' as const, date: new Date().toISOString().slice(0,10), note: 'Application submitted by user' };
                  setHistory((s) => [entry, ...s]);
                  setCurrent(entry);
                  setToast('Application submitted');
                  setTimeout(() => setToast(null), 3000);
                }} />
              </div>
            )}
          </div>
        </section>
      </main>

      {confirmOpen && (
        <div role="dialog" className={styles.modal} aria-modal="true">
          <div className={styles.modalCard}>
            <h3>Request replacement</h3>
            <p>Submitting a replacement request will flag your current card and create a pending request for security review. Continue?</p>
            <div className={styles.modalActions}>
              <button className={styles.ghost} onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className={styles.primary} onClick={handleRequestReplacement} disabled={requesting}>{requesting ? 'Submitting…' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}

function ReplacementForm({ onApply }: { onApply: (data: { notes?: string; file?: File | null }) => Promise<void> | void }) {
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      await onApply({ notes, file });
      setNotes(""); setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.applyInner}>
      <label className={styles.label}>Reason for replacement <span className={styles.required}>*</span></label>
      <textarea className={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} required />

      <label className={styles.label} style={{ marginTop: 8 }}>Upload supporting document (optional)</label>
      <input className={styles.fileInput} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button className={styles.primary} type="submit" disabled={submitting}>{submitting ? 'Applying…' : 'Apply for new ID'}</button>
      </div>
    </form>
  );
}
