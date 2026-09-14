import { useState } from "react";
import { AuthLayout, Field } from "./Login";
import { registerUser } from "../api";

export default function Register({ logo, onRegister, onLogin, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState("");
  async function submit(event) { event.preventDefault(); if (!form.name || !form.email || form.password.length < 6) return setError("Enter your name, email, and a password of at least 6 characters."); setError(""); try { await registerUser(form); onRegister(); } catch (requestError) { setError(requestError.message); } }
  return <AuthLayout logo={logo} title="Create your account" subtitle="Start seeing your money more clearly." onBack={onBack}><form onSubmit={submit} className="space-y-4"><Field label="Your name" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Your name" /><Field label="Email address" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} placeholder="you@example.com" /><Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} placeholder="At least 6 characters" />{error && <p className="rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}<button className="w-full rounded-xl bg-mm-green py-3.5 font-black text-mm-navy hover:bg-mm-green-light">Create account</button></form><p className="mt-6 text-center text-sm text-mm-muted">Already have an account? <button onClick={onLogin} className="font-bold text-mm-green">Log in</button></p></AuthLayout>;
}
