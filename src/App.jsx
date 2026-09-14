import { useEffect, useState } from "react";

import "./App.css";

import logo from "./assets/logo.png";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FeaturePage from "./pages/FeaturePage";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { getCurrentUser, listBudgets, listGoals, listTransactions } from "./api";

function toClientTransaction(record, type) {
  return {
    id: record.id,
    name: record.description,
    category: type === "income" ? record.source : record.category,
    date: record.date,
    amount: record.amount,
  };
}

function App() {
  const [page, setPage] = useState(() => (
    window.location.pathname === "/verify-email" ? "verify-email"
      : window.location.pathname === "/forgot-password" ? "forgot-password"
      : window.location.pathname === "/reset-password" ? "reset-password"
      : window.location.pathname === "/profile" ? "profile"
      : localStorage.getItem("moneymap-user")
      ? "dashboard"
      : "landing"
  ));
  const [authNotice, setAuthNotice] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("moneymap-user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("moneymap-user");
      return null;
    }
  });

  const [financialData, setFinancialData] = useState(() => {
    const emptyData = {
      income: [],
      expenses: [],
      budgets: [],
      savings: [],
    };

    try {
      const savedUser = JSON.parse(
        localStorage.getItem("moneymap-user") || "null"
      );

      const savedData =
        savedUser?.email &&
        localStorage.getItem(
          `moneymap-finance-${savedUser.email}`
        );

      return savedData
        ? JSON.parse(savedData)
        : emptyData;
    } catch {
      return emptyData;
    }
  });

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(
        `moneymap-finance-${user.email}`,
        JSON.stringify(financialData)
      );
    }
  }, [financialData, user?.email]);

  useEffect(() => {
    const token = localStorage.getItem("moneymap-token");
    if (!token || !user?.email) return;
    getCurrentUser(token)
      .then((profile) => {
        setUser(profile);
        localStorage.setItem("moneymap-user", JSON.stringify(profile));
      })
      .catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    const token = localStorage.getItem(
      "moneymap-token"
    );

    if (!user?.email || !token) return;

    Promise.all([
      listTransactions("expenses", token),
      listTransactions("income", token),
      listBudgets(token),
      listGoals(token),
    ])
      .then(([expenses, income, budgets, goals]) =>
        setFinancialData((current) => ({
          ...current,
          expenses: expenses.map((record) =>
            toClientTransaction(
              record,
              "expenses"
            )
          ),
          income: income.map((record) =>
            toClientTransaction(
              record,
              "income"
            )
          ),
          budgets: budgets.map((budget) => ({ id: budget.id, name: budget.name, amount: budget.amount })),
          savings: goals.map((goal) => ({ id: goal.id, name: goal.name, amount: goal.amount, saved: goal.saved })),
        }))
      )
      .catch(() => {});
  }, [user?.email]);

  /* =========================
     LOGIN
  ========================= */

  async function handleLogin(
    loggedInUser,
    token
  ) {
    const userData = {
      name:
        loggedInUser?.name ||
        "User",
      email:
        loggedInUser?.email ||
        "",
    };

    let userFinance = {
      income: [],
      expenses: [],
      budgets: [],
      savings: [],
    };

    try {
      userFinance =
        JSON.parse(
          localStorage.getItem(
            `moneymap-finance-${userData.email}`
          )
        ) || userFinance;
    } catch {
      // New users start with empty financial data.
    }

    setFinancialData(userFinance);
    setUser(userData);

    localStorage.setItem(
      "moneymap-user",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "moneymap-token",
      token
    );

    setPage("dashboard");
  }

  /* =========================
     REGISTER
  ========================= */

  function handleRegisterSuccess() {
    setPage("login");
  }

  /* =========================
     LOGOUT
  ========================= */

  function handleLogout() {
    localStorage.removeItem(
      "moneymap-user"
    );

    localStorage.removeItem(
      "moneymap-token"
    );

    setUser(null);

    setFinancialData({
      income: [],
      expenses: [],
      budgets: [],
      savings: [],
    });

    setPage("landing");
  }

  function handleUserChange(profile) {
    setUser(profile);
    localStorage.setItem("moneymap-user", JSON.stringify(profile));
  }

  if (page === "verify-email") {
    return <VerifyEmail onDone={() => { window.history.replaceState({}, "", "/"); setPage("login"); }} />;
  }

  if (page === "forgot-password") {
    return <ForgotPassword logo={logo} onBack={() => { window.history.replaceState({}, "", "/"); setPage("landing"); }} onBackToLogin={() => { window.history.replaceState({}, "", "/"); setPage("login"); }} />;
  }

  if (page === "reset-password") {
    return <ResetPassword logo={logo} onBack={() => { window.history.replaceState({}, "", "/"); setPage("landing"); }} onDone={() => { window.history.replaceState({}, "", "/"); setAuthNotice("Password reset successfully. You can now log in."); setPage("login"); }} />;
  }

  /* =========================
     PUBLIC
  ========================= */

  if (!user) {
    if (page === "login") {
      return (
        <Login
          logo={logo}
          onLogin={handleLogin}
          onRegister={() =>
            setPage("register")
          }
          onForgotPassword={() => { window.history.pushState({}, "", "/forgot-password"); setPage("forgot-password"); }}
          onBack={() =>
            setPage("landing")
          }
          notice={authNotice}
        />
      );
    }

    if (page === "register") {
      return (
        <Register
          logo={logo}
          onRegister={
            handleRegisterSuccess
          }
          onLogin={() =>
            setPage("login")
          }
          onBack={() =>
            setPage("landing")
          }
        />
      );
    }

    return (
      <Landing
        logo={logo}
        onLogin={() =>
          setPage("login")
        }
        onRegister={() =>
          setPage("register")
        }
      />
    );
  }

  /* =========================
     LOGGED-IN APPLICATION
  ========================= */

  return (
    <MoneyMapApp
      user={user}
      logo={logo}
      page={page}
      setPage={setPage}
      onLogout={handleLogout}
      onUserChange={handleUserChange}
      financialData={financialData}
      setFinancialData={
        setFinancialData
      }
    />
  );
}

/* =====================================================
   MONEYMAP APPLICATION
===================================================== */

function MoneyMapApp({
  user,
  logo,
  page,
  setPage,
  onLogout,
  onUserChange,
  financialData,
  setFinancialData,
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const navigation = [
    {
      section: "MONEY",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: "⌂",
        },
        {
          id: "income",
          label: "Income",
          icon: "↗",
        },
        {
          id: "expenses",
          label: "Expenses",
          icon: "↘",
        },
        {
          id: "budgets",
          label: "Budgets",
          icon: "▣",
        },
        {
          id: "savings",
          label: "Savings Goals",
          icon: "◎",
        },
      ],
    },

    {
      section: "ACCOUNT",
      items: [{ id: "profile", label: "Profile & settings", icon: "◉" }],
    },

    {
      section: "INTELLIGENCE",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: "◔",
        },
        {
          id: "patterns",
          label: "Spending Patterns",
          icon: "⌁",
        },
        {
          id: "leaks",
          label: "Financial Leaks",
          icon: "◉",
        },
        {
          id: "unusual",
          label: "Unusual Expenses",
          icon: "!",
        },
        {
          id: "predictions",
          label: "Predictions",
          icon: "↗",
        },
        {
          id: "insights",
          label: "Personalized Insights",
          icon: "✦",
        },
      ],
    },

    {
      section: "PLANNING",
      items: [
        {
          id: "simulator",
          label: "What-If Simulator",
          icon: "◇",
        },

        {
          id: "financial-health",
          label: "Financial Health",
          icon: "♥",
        },

    
      
      ],
    },
  ];

  const titles = {
    dashboard: "Dashboard",
    income: "Income",
    expenses: "Expenses",
    budgets: "Budgets",
    savings: "Savings Goals",
    analytics: "Analytics",
    patterns: "Spending Patterns",
    leaks: "Financial Leaks",
    unusual: "Unusual Expenses",
    predictions: "Predictions",
    insights: "Personalized Insights",
    simulator: "What-If Simulator",

    "financial-health":
      "Financial Health",
    profile: "Profile & settings",

  };

  function navigate(nextPage) {
    if (nextPage === "profile") {
      window.history.pushState({}, "", "/profile");
    } else if (window.location.pathname === "/profile") {
      window.history.pushState({}, "", "/");
    }
    setPage(nextPage);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-mm-navy text-mm-text">

      {/* ================= MOBILE OVERLAY ================= */}

      {sidebarOpen && (
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-mm-border bg-mm-navy transition-transform duration-200 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Brand */}

        <div className="border-b border-mm-border px-5 py-5">

          <button
            type="button"
            onClick={() =>
              navigate("dashboard")
            }
            className="flex w-full items-center gap-3 text-left"
          >

            <img
              src={logo}
              alt="MoneyMap"
              className="h-11 w-11 shrink-0 rounded-full object-contain"
            />

            <div>

              <div className="text-xl font-black tracking-tight">
                Money<span className="text-mm-green">
                  Map
                </span>
              </div>

              <div className="text-[8px] font-bold tracking-[0.15em] text-mm-muted">
                SEE WHERE YOUR MONEY GOES
              </div>

            </div>

          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {navigation.map((group) => (
            <div
              key={group.section}
              className="mb-6"
            >

              <p className="mb-2 px-3 text-[10px] font-black tracking-[0.16em] text-mm-muted">
                {group.section}
              </p>

              <div className="space-y-1">

                {group.items.map(
                  (item) => {

                    const active =
                      page === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          navigate(
                            item.id
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          active
                            ? "bg-mm-green/10 text-mm-green"
                            : "text-mm-muted hover:bg-mm-card hover:text-mm-text"
                        }`}
                      >

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                            active
                              ? "bg-mm-green text-mm-navy"
                              : "bg-mm-blue/30 text-mm-muted"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span>
                          {item.label}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

            </div>
          ))}

        </nav>

        {/* User */}

        <div className="border-t border-mm-border p-4">

          <button type="button" onClick={() => navigate("profile")} className="flex w-full items-center gap-3 rounded-xl bg-mm-card p-3 text-left hover:bg-mm-blue/30">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mm-green font-black text-mm-navy">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-bold">
                {user?.name ||
                  "User"}
              </p>

              <p className="truncate text-xs text-mm-muted">
                {user?.email ||
                  ""}
              </p>

            </div>

          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-mm-muted transition hover:bg-red-400/10 hover:text-red-300"
          >
            Log out
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <div className="min-h-screen lg:ml-[270px]">

        {/* TOPBAR */}

        <header className="sticky top-0 z-30 border-b border-mm-border bg-mm-navy/95 backdrop-blur-xl">

          <div className="flex h-[78px] items-center justify-between px-5 sm:px-8">

            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-mm-border bg-mm-card lg:hidden"
              >
                ☰
              </button>

              <div>

                <p className="text-[9px] font-black tracking-[0.17em] text-mm-green">
                  MONEYMAP
                </p>

                <h1 className="text-xl font-black">
                  {titles[page] ||
                    "Dashboard"}
                </h1>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-bold">
                  {user?.name ||
                    "User"}
                </p>

                <p className="text-xs text-mm-muted">
                  Personal account
                </p>

              </div>

              <button type="button" onClick={() => navigate("profile")} aria-label="Open profile settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-mm-green font-black text-mm-navy">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}
              </button>

            </div>

          </div>

        </header>

        {/* PAGE */}

        <main className="px-5 py-7 sm:px-8 lg:px-10">

          <div className="mx-auto max-w-7xl">

            {page === "profile" ? (
              <Profile user={user} token={localStorage.getItem("moneymap-token")} financialData={financialData} onUserChange={onUserChange} onLogout={onLogout} onForgotPassword={() => { window.history.pushState({}, "", "/forgot-password"); setPage("forgot-password"); }} />
            ) : page ===
            "dashboard" ? (
              <Dashboard
                user={user}
                setPage={setPage}
                financialData={
                  financialData
                }
              />
            ) : (
              <FeaturePage
                page={page}
                setPage={setPage}
                financialData={
                  financialData
                }
                setFinancialData={
                  setFinancialData
                }
              />
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default App;
