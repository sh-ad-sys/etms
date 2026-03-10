
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import styles from '../../../../styles/lostid.module.css';

export default function LostIDPage() {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [dateLost, setDateLost] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!name || !employeeId || !location) {
    alert("Please fill required fields");
    return;
  }

  setSubmitting(true);

  try {

    const form = new FormData();

    form.append("name", name);
    form.append("employeeId", employeeId);
    form.append("dateLost", dateLost);
    form.append("location", location);
    form.append("notes", notes);

    const file = fileRef.current?.files?.[0];
    if (file) {
      form.append("evidence", file);
    }

    const res = await fetch(
      "http://localhost/etms/controllers/id/report-lost-id.php",
      {
        method: "POST",
        credentials: "include",
        body: form
      }
    );

    const data: { success: boolean; error?: string } = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Submission failed");
    }

    setSuccess(true);

    setName("");
    setEmployeeId("");
    setLocation("");
    setNotes("");

    if (fileRef.current) fileRef.current.value = "";

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

  } catch (err) {
    console.error(err);
    alert("Failed to submit report");
  } finally {
    setSubmitting(false);
    setTimeout(() => setSuccess(false), 2500);
  }
};
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
      return;
    }
    const url = URL.createObjectURL(f);
    // revoke previous
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Report Lost ID</h1>
          <p className={styles.lead}>Securely report and track lost staff identity cards.</p>
        </div>
      </header>

      <main className={styles.grid}>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <section className={styles.card} style={{ maxWidth: 760, width: '100%' }}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <label className={styles.label}>Full name <span className={styles.required}>*</span></label>
                <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" required />
              </div>

              <div className={styles.rowSplit}>
                <div>
                  <label className={styles.label}>Employee ID <span className={styles.required}>*</span></label>
                  <input className={styles.input} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP-0000" required />
                </div>

                <div>
                  <label className={styles.label}>Date lost <span className={styles.required}>*</span></label>
                  <input className={styles.input} type="date" value={dateLost} onChange={(e) => setDateLost(e.target.value)} required />
                </div>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Location <span className={styles.required}>*</span></label>
                <input className={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Reception, Floor 2" required />
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Notes / Details <span className={styles.required}>*</span></label>
                <textarea className={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Provide details (where, when, distinguishing marks)..." required />
              </div>

              <div className={styles.rowSplit}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label}>Upload evidence</label>
                  <input ref={fileRef} onChange={handleFileChange} type="file" accept="image/*,application/pdf" className={styles.fileInput} />

                  {previewUrl && (
                    <div className={styles.preview}>
                      <Image src={previewUrl} alt="preview" width={600} height={400} className={styles.previewImage} unoptimized />
                      <div className={styles.previewNote}>Preview of uploaded evidence</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}>
                  <button type="submit" className={styles.submit} disabled={submitting}>{submitting ? 'Reporting…' : 'Report Lost ID'}</button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>

      {success && (
        <div className={styles.toast} role="status">Report submitted.</div>
      )}
    </div>
  );
}
