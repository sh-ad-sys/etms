"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import "@/styles/profile.css";
import Image from "next/image";
import {
  User, Mail, Briefcase, Save, Camera,
  Phone, Building2, BadgeCheck, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */

interface Profile {
  id:           string;
  employeeCode: string;
  full_name:    string;
  email:        string;
  phone:        string;
  department:   string;
  avatar:       string;
  role:         string;
}

interface FormState {
  full_name:  string;
  email:      string;
  phone:      string;
  department: string;
}

const API = "http://localhost/etms/controllers";

/* ─── Component ─────────────────────────────────────────── */

export default function ProfilePage() {

  const [profile,    setProfile]    = useState<Profile | null>(null);
  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [avatarPrev, setAvatarPrev] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>({
    full_name:  "",
    email:      "",
    phone:      "",
    department: "",
  });

  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Fetch profile ── */

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/get-profile.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setForm({
          full_name:  data.user.full_name,
          email:      data.user.email,
          phone:      data.user.phone      || "",
          department: data.user.department || "",
        });
      } else {
        setError(data.error || "Failed to load profile.");
      }
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── Avatar preview ── */

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPrev(URL.createObjectURL(file));
  };

  /* ── Save ── */

  const saveProfile = async () => {
    setError(""); setSuccess(""); setSaving(true);

    try {
      const fd = new FormData();
      fd.append("full_name",  form.full_name);
      fd.append("email",      form.email);
      fd.append("phone",      form.phone);
      fd.append("department", form.department);
      if (avatarFile) fd.append("avatar", avatarFile);

      const res  = await fetch(`${API}/update-profile.php`, {
        method:      "POST",
        credentials: "include",
        body:        fd,
      });
      const data = await res.json();

      if (data.success) {
        setProfile((prev) => prev ? { ...prev, ...data.user } : prev);
        setSuccess("Profile updated successfully.");
        setEditing(false);
        setAvatarFile(null);
        setAvatarPrev(null);
      } else {
        setError(data.error || "Failed to save profile.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!profile) return;
    setForm({
      full_name:  profile.full_name,
      email:      profile.email,
      phone:      profile.phone      || "",
      department: profile.department || "",
    });
    setAvatarFile(null);
    setAvatarPrev(null);
    setError("");
    setEditing(false);
  };

  /* ── Render ── */

  if (loading) return (
    <div className="profile-loading">
      <Loader2 size={24} className="spin" /> Loading profile...
    </div>
  );

  if (!profile) return (
    <div className="profile-loading" style={{ color: "#ef4444" }}>
      Failed to load profile.
    </div>
  );

  const avatarSrc = avatarPrev
    || (profile.avatar ? `http://localhost/etms/${profile.avatar}` : "/logo.jpeg");

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* LEFT — avatar + name */}
        <div className="profile-left">

          <div className="avatar-box">
            <Image
              src={avatarSrc}
              alt="avatar"
              width={120}
              height={120}
              className="avatar-img"
            />
            <button
              className="avatar-edit"
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          <h2>{profile.full_name}</h2>
          <p className="profile-role">{profile.role}</p>

          {profile.employeeCode && (
            <span className="employee-code">
              <BadgeCheck size={13} /> {profile.employeeCode}
            </span>
          )}

        </div>

        {/* RIGHT — form */}
        <div className="profile-right">

          <h3>Profile Information</h3>

          {/* Banners */}
          {error && (
            <div className="profile-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div className="profile-success">
              <CheckCircle2 size={15} /> {success}
            </div>
          )}

          <div className="profile-form">

            <label><User size={15} /> Full Name <span className="req">*</span></label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              disabled={!editing}
              placeholder="Full name"
            />

            <label><Mail size={15} /> Email <span className="req">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!editing}
              placeholder="Email address"
            />

            <label><Phone size={15} /> Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              placeholder="07XX XXX XXX"
            />

            <label><Building2 size={15} /> Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              disabled={!editing}
              placeholder="e.g. Production"
            />

            <label><Briefcase size={15} /> Role</label>
            <input value={profile.role} disabled className="input-disabled" />

          </div>

          <div className="profile-actions">

            {!editing && (
              <button onClick={() => { setSuccess(""); setEditing(true); }} className="btn-primary">
                Edit Profile
              </button>
            )}

            {editing && (
              <>
                <button onClick={saveProfile} className="btn-save" disabled={saving}>
                  {saving
                    ? <><Loader2 size={15} className="spin" /> Saving...</>
                    : <><Save size={15} /> Save Changes</>
                  }
                </button>
                <button onClick={cancelEdit} className="btn-cancel" disabled={saving}>
                  Cancel
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}