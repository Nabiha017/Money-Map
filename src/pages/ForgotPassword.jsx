import { useState } from "react";
import { requestPasswordReset } from "../api";
import { AuthLayout, Field } from "./Login";

export default function ForgotPassword({ logo, onBackToLogin, onBack }) {
  const [form, setForm] = useState({ email: "", password: "", confirmation: "" });
  const [state, setState] = useState({ error: "", message: "", loading: false });

  async function submit(event) {
    event.preventDefault();
    if (!form.email) return setState((current) => ({ ...current, error: "Enter your email address." }));
    if (form.password.length < 6) return setState((current) => ({ ...current, error: "Use a password of at least 6 characters." }));
    if (form.password !== form.confirmation) return setState((current) => ({ ...current, error: "The passwords do not match." }));
    setState({ error: "", message: "", loading: true });
    try {
      const response = await requestPasswordReset(form.email, form.password);
      setState({ error: "", message: response.message, loading: false });
    } catch (error) {
      setState({ error: error.message, message: "", loading: false });
    }
  }

  return <AuthLayout logo={logo} title="Reset your password" subtitle="Set a new password for your local MoneyMap account." onBack={onBack}><form onSubmit={submit} className="space-y-4"><Field label="Email address" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} placeholder="you@example.com" /><Field label="New password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} placeholder="At least 6 characters" /><Field label="Confirm new password" type="password" value={form.confirmation} onChange={(confirmation) => setForm({ ...form, confirmation })} placeholder="Repeat your new password" />{state.error && <p className="rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{state.error}</p>}{state.message && <p className="rounded-xl bg-mm-green/10 p-3 text-sm text-mm-green">{state.message}</p>}<button disabled={state.loading} className="w-full rounded-xl bg-mm-green py-3.5 font-black text-mm-navy disabled:opacity-60">{state.loading ? "Resetting…" : "Reset password"}</button></form><p className="mt-6 text-center text-sm text-mm-muted"><button type="button" onClick={onBackToLogin} className="font-bold text-mm-green">Back to log in</button></p></AuthLayout>;
}
