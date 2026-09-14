const features = [
  ["↗", "Track every rupee", "Keep income, expenses, budgets, and savings goals in one calm, clear place."],
  ["◔", "Understand your habits", "See category trends and the small recurring purchases that quietly add up."],
  ["✦", "Make confident choices", "Use predictions and what-if planning before you spend."],
];

export default function Landing({ logo, onLogin, onRegister }) {
  return (
    <div className="min-h-screen overflow-hidden bg-mm-navy text-mm-text">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="MoneyMap" className="h-11 w-11 rounded-full object-contain" />
          <div>
            <p className="text-xl font-black tracking-tight">Money<span className="text-mm-green">Map</span></p>
            <p className="text-[8px] font-bold tracking-[.17em] text-mm-muted">SEE WHERE YOUR MONEY GOES</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogin} className="rounded-xl px-4 py-2.5 text-sm font-bold text-mm-muted hover:text-mm-text">Log in</button>
          <button onClick={onRegister} className="rounded-xl bg-mm-green px-4 py-2.5 text-sm font-black text-mm-navy transition hover:bg-mm-green-light">Get started</button>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pb-28 lg:pt-24">
          <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-mm-green/10 blur-3xl" />
          <div className="relative">
            <p className="inline-flex rounded-full border border-mm-green/30 bg-mm-green/10 px-3 py-1 text-xs font-bold text-mm-green">Personal finance, made clearer</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl">Know where your money goes. <span className="text-mm-green">Know what to do next.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-mm-muted">MoneyMap brings your everyday spending, goals, and habits into focus—then turns them into simple, useful decisions.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onRegister} className="rounded-xl bg-mm-green px-6 py-3.5 font-black text-mm-navy transition hover:bg-mm-green-light">Create your free account</button>
              <button onClick={onLogin} className="rounded-xl border border-mm-border bg-mm-card px-6 py-3.5 font-bold hover:border-mm-blue-light">I already have an account</button>
            </div>
            <p className="mt-4 text-sm text-mm-muted">No bank connection needed. You stay in control of your data.</p>
          </div>

          <div className="relative rounded-3xl border border-mm-border bg-mm-card p-5 shadow-2xl shadow-black/25 sm:p-7">
            <div className="flex items-center justify-between"><div><p className="text-sm text-mm-muted">This month</p><p className="mt-1 text-3xl font-black">₹42,680</p><p className="mt-1 text-sm font-bold text-mm-green">₹6,320 left to save</p></div><div className="rounded-2xl bg-mm-green/15 px-4 py-3 text-right"><p className="text-xs text-mm-muted">Monthly goal</p><p className="font-black text-mm-green">84% on track</p></div></div>
            <div className="mt-7 rounded-2xl border border-mm-border bg-mm-navy-light p-5"><div className="flex items-end justify-between gap-2 h-32">{[38,56,42,74,48,88,62,78,55,92,69,84].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-mm-blue" style={{ height: `${height}%`, opacity: index > 8 ? 1 : .55 }} />)}</div><div className="mt-3 flex justify-between text-[10px] font-bold text-mm-muted"><span>1 AUG</span><span>TODAY</span><span>31 AUG</span></div></div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-mm-green/20 bg-mm-green/10 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mm-green text-xl text-mm-navy">✦</span><p className="text-sm leading-5"><b className="text-mm-green">Smart insight</b><br /><span className="text-mm-muted">Food delivery is up 18% this month.</span></p></div>
          </div>
        </section>

        <section className="border-y border-mm-border bg-mm-navy-light/40"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:grid-cols-3 sm:px-8">{features.map(([icon, title, body]) => <div key={title} className="rounded-2xl border border-mm-border bg-mm-card/70 p-6"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mm-green/15 text-xl text-mm-green">{icon}</span><h2 className="mt-5 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-mm-muted">{body}</p></div>)}</div></section>
      </main>
      <footer className="mx-auto max-w-7xl px-5 py-8 text-sm text-mm-muted sm:px-8">© 2026 MoneyMap · See where your money goes.</footer>
    </div>
  );
}
