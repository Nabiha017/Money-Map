import { useState } from "react";
import { changePassword, updateCurrentUser } from "../api";

const symbols = { INR: "₹", USD: "$", EUR: "€" };

function total(items) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export default function Profile({ user, token, financialData, onUserChange, onLogout, onForgotPassword }) {
  const [form, setForm] = useState({ name: user?.name || "", currency: user?.currency || "INR" });
  const [profileState, setProfileState] = useState({ error: "", message: "", saving: false });
  const [passwords, setPasswords] = useState({ password: "", confirmation: "" });
  const [passwordState, setPasswordState] = useState({ error: "", message: "", saving: false });
  const incomeItems = financialData?.income || [];
  const expenseItems = financialData?.expenses || [];
  const goals = financialData?.savings || [];
  const income = total(incomeItems);
  const expenses = total(expenseItems);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : null;
  const transactionCount = incomeItems.length + expenseItems.length;
  const completedGoals = goals.filter((goal) => Number(goal.amount) > 0 && Number(goal.saved) >= Number(goal.amount)).length;
  const categoryTotals = expenseItems.reduce((all, item) => {
    const category = item.category || "Other";
    all[category] = (all[category] || 0) + Number(item.amount || 0);
    return all;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort(([, left], [, right]) => right - left)[0];
  const currency = form.currency || "INR";
  const money = (value) => `${symbols[currency]}${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const memberSince = user?.member_since ? new Date(user.member_since).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Unavailable";

  async function saveProfile(event) {
    event.preventDefault();
    if (!form.name.trim()) return setProfileState({ error: "Please enter your full name.", message: "", saving: false });
    setProfileState({ error: "", message: "", saving: true });
    try {
      const updated = await updateCurrentUser({ name: form.name.trim(), currency }, token);
      onUserChange(updated);
      setProfileState({ error: "", message: "Personal information saved.", saving: false });
    } catch (error) {
      setProfileState({ error: error.message, message: "", saving: false });
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (passwords.password.length < 6) return setPasswordState({ error: "Use a password of at least 6 characters.", message: "", saving: false });
    if (passwords.password !== passwords.confirmation) return setPasswordState({ error: "The passwords do not match.", message: "", saving: false });
    setPasswordState({ error: "", message: "", saving: true });
    try {
      await changePassword(passwords.password, token);
      setPasswords({ password: "", confirmation: "" });
      setPasswordState({ error: "", message: "Password changed successfully.", saving: false });
    } catch (error) {
      setPasswordState({ error: error.message, message: "", saving: false });
    }
  }

  return <div className="space-y-7">
    <header><p className="text-sm text-mm-green">ACCOUNT</p><h2 className="mt-1 text-3xl font-black">Profile & settings</h2><p className="mt-2 text-mm-muted">Your account and progress, based on your MoneyMap data.</p></header>

    <section className="rounded-3xl border border-mm-border bg-mm-card p-6 sm:p-8">
      <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-mm-green text-xl font-black text-mm-navy">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div><div><h3 className="text-xl font-black">{user?.name}</h3><p className="text-sm text-mm-muted">{user?.email}</p></div></div>
      <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={saveProfile}>
        <label className="block text-sm font-bold">Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green" /></label>
        <label className="block text-sm font-bold text-mm-muted">Email address<input value={user?.email || ""} readOnly className="mt-2 w-full cursor-not-allowed rounded-xl border border-mm-border bg-mm-navy px-4 py-3 text-mm-muted" /></label>
        <label className="block text-sm font-bold">Currency preference<select value={currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"><option value="INR">INR ₹</option><option value="USD">USD $</option><option value="EUR">EUR €</option></select></label>
        <div className="flex items-end"><button disabled={profileState.saving} className="w-full rounded-xl bg-mm-green px-5 py-3 font-black text-mm-navy disabled:opacity-60">{profileState.saving ? "Saving…" : "Save profile"}</button></div>
      </form>
      {profileState.error && <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{profileState.error}</p>}{profileState.message && <p className="mt-4 rounded-xl bg-mm-green/10 p-3 text-sm text-mm-green">{profileState.message}</p>}
    </section>

    <section className="rounded-3xl border border-mm-border bg-mm-card p-6 sm:p-8"><h3 className="text-xl font-black">Financial Snapshot</h3><p className="mt-1 text-sm text-mm-muted">Calculated from your recorded income, expenses, and savings goals.</p>{transactionCount ? <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Stat label="Total income" value={money(income)} tone="text-mm-green" /><Stat label="Total expenses" value={money(expenses)} tone="text-red-400" /><Stat label="Current savings" value={money(savings)} tone={savings >= 0 ? "text-mm-green" : "text-red-400"} /><Stat label="Savings rate" value={savingsRate === null ? "Not available" : `${savingsRate.toFixed(1)}%`} /><Stat label="Active savings goals" value={String(goals.length)} /></div> : <Empty message="No financial data yet. Add your first transaction to see your financial snapshot." />}</section>

    <section className="rounded-3xl border border-mm-border bg-mm-card p-6 sm:p-8"><h3 className="text-xl font-black">Your MoneyMap Journey</h3>{transactionCount || goals.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Member since" value={memberSince} /><Stat label="Transactions recorded" value={String(transactionCount)} /><Stat label="Savings goals completed" value={`${completedGoals} of ${goals.length}`} /><Stat label="Highest spending category" value={topCategory ? topCategory[0] : "Not enough data"} detail={topCategory ? money(topCategory[1]) : undefined} /></div> : <Empty message={`Your journey started in ${memberSince}. Add income or expenses to see your progress.`} />}</section>

    <section className="rounded-3xl border border-mm-border bg-mm-card p-6 sm:p-8"><h3 className="text-xl font-black">Security</h3><p className="mt-1 text-sm text-mm-muted">Update your password for this signed-in account.</p><form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={savePassword}><label className="block text-sm font-bold">New password<input type="password" value={passwords.password} onChange={(event) => setPasswords({ ...passwords, password: event.target.value })} placeholder="At least 6 characters" className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green" /></label><label className="block text-sm font-bold">Confirm new password<input type="password" value={passwords.confirmation} onChange={(event) => setPasswords({ ...passwords, confirmation: event.target.value })} placeholder="Repeat your password" className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green" /></label><div className="flex flex-wrap gap-3 sm:col-span-2"><button disabled={passwordState.saving} className="rounded-xl bg-mm-green px-5 py-3 font-black text-mm-navy disabled:opacity-60">{passwordState.saving ? "Changing…" : "Change password"}</button><button type="button" onClick={onForgotPassword} className="rounded-xl border border-mm-border px-5 py-3 font-bold text-mm-muted hover:text-mm-text">Forgot password?</button><button type="button" onClick={onLogout} className="rounded-xl px-5 py-3 font-bold text-red-400 hover:bg-red-400/10">Log out</button></div></form>{passwordState.error && <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{passwordState.error}</p>}{passwordState.message && <p className="mt-4 rounded-xl bg-mm-green/10 p-3 text-sm text-mm-green">{passwordState.message}</p>}</section>
  </div>;
}

function Stat({ label, value, detail, tone = "" }) { return <div className="rounded-2xl bg-mm-navy p-4"><p className="text-xs font-bold text-mm-muted">{label}</p><p className={`mt-2 text-xl font-black ${tone}`}>{value}</p>{detail && <p className="mt-1 text-xs text-mm-muted">{detail}</p>}</div>; }
function Empty({ message }) { return <p className="mt-6 rounded-2xl bg-mm-navy p-5 text-sm text-mm-muted">{message}</p>; }
