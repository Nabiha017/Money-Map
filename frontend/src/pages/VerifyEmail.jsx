import { useEffect, useState } from "react";
import { verifyEmail } from "../api";

export default function VerifyEmail({ onDone }) {
  const token = new URLSearchParams(window.location.search).get("token");
  const [state, setState] = useState(() => token
    ? { loading: true, message: "Verifying your email…", ok: false }
    : { loading: false, ok: false, message: "This verification link is invalid or incomplete." });

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => setState({ loading: false, ok: true, message: "Your email has been verified successfully." }))
      .catch((error) => setState({ loading: false, ok: false, message: error.message.includes("expired") ? "This verification link has expired. Sign in and request a new one." : error.message }));
  }, [token]);

  return <div className="flex min-h-screen items-center justify-center bg-mm-navy p-5 text-mm-text"><section className="w-full max-w-md rounded-3xl border border-mm-border bg-mm-card p-8 text-center"><p className="text-sm font-black tracking-[.16em] text-mm-green">MONEYMAP</p><h1 className="mt-3 text-3xl font-black">{state.loading ? "Verifying email" : state.ok ? "Email verified" : "Verification unavailable"}</h1><p className="mt-4 text-mm-muted">{state.message}</p>{!state.loading && <button onClick={onDone} className="mt-7 rounded-xl bg-mm-green px-5 py-3 font-black text-mm-navy">Go to sign in</button>}</section></div>;
}
