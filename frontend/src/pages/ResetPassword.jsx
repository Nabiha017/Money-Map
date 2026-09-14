import { useState } from "react";
import { resetPassword } from "../api";
import { AuthLayout, Field } from "./Login";

export default function ResetPassword({ logo, onDone, onBack }) {
  const token = new URLSearchParams(window.location.search).get("token");
  const [form, setForm] = useState({ password: "", confirmation: "" });
  const [state, setState] = useState({ error: "", loading: false });
  async function submit(event) {
    event.preventDefault();
    if (!token) return setState({ error: "This password-reset link is invalid or incomplete.", loading: false });
    if (form.password.length < 6) return setState({ error: "Use a password of at least 6 characters.", loading: false });
    if (form.password !== form.confirmation) return setState({ error: "The passwords do not match.", loading: false });
    setState({ error: "", loading: true });
    try {
      await resetPassword(token, form.password);
      onDone();
    } catch (error) {
      setState({ error: error.message, loading: false });
    }
  }
  return <AuthLayout logo={logo} title="Choose a new password" subtitle="Your new password will replace the old one." onBack={onBack}><form onSubmit={submit} className="space-y-4"><Field label="New password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} placeholder="At least 6 characters" /><Field label="Confirm new password" type="password" value={form.confirmation} onChange={(confirmation) => setForm({ ...form, confirmation })} placeholder="Repeat your password" />{state.error && <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{state.error}</p>}<button disabled={state.loading} className="w-full rounded-xl bg-mm-green py-3.5 font-black text-mm-navy disabled:opacity-60">{state.loading ? "Resetting…" : "Reset password"}</button></form></AuthLayout>;
}
