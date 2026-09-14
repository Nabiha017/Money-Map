import {
  ExpensePieChart,
  IncomeExpenseChart,
  SpendingTrendChart,
  MonthlyIncomeExpenseChart,
} from "../components/FinancialCharts";

/* =========================================================
   MONEY FORMAT
========================================================= */

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

/* =========================================================
   MONEY CARD
========================================================= */

function MoneyCard({
  label,
  value,
  detail,
  green,
  red,
}) {
  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
      <p className="text-sm font-bold text-mm-muted">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-black tracking-tight ${
          green
            ? "text-mm-green"
            : red
              ? "text-red-400"
              : ""
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-xs font-bold ${
          green
            ? "text-mm-green"
            : red
              ? "text-red-400"
              : "text-mm-muted"
        }`}
      >
        {detail}
      </p>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard({
  user,
  setPage,
  financialData,
}) {
  /* -------------------------------------------------------
     SAFETY
  ------------------------------------------------------- */

  const incomeData =
    financialData?.income || [];

  const expenseData =
    financialData?.expenses || [];

  const budgetData =
    financialData?.budgets || [];

  /* -------------------------------------------------------
     TOTAL INCOME
  ------------------------------------------------------- */

  const income = incomeData.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  /* -------------------------------------------------------
     TOTAL EXPENSES
  ------------------------------------------------------- */

  const expenses = expenseData.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  /* -------------------------------------------------------
     BALANCE
  ------------------------------------------------------- */

  const balance = income - expenses;

  /* -------------------------------------------------------
     TRANSACTIONS
  ------------------------------------------------------- */

  const transactions = [
    ...expenseData.map((item) => ({
      ...item,
      type: "expense",
    })),

    ...incomeData.map((item) => ({
      ...item,
      type: "income",
    })),
  ]
    .sort((a, b) =>
      String(b.date || "").localeCompare(
        String(a.date || "")
      )
    )
    .slice(0, 5);

  /* -------------------------------------------------------
     EXPENSE CATEGORIES
  ------------------------------------------------------- */

  const categoryTotals =
    expenseData.reduce(
      (all, item) => {
        const category =
          item.category || "Other";

        all[category] =
          (all[category] || 0) +
          Number(item.amount || 0);

        return all;
      },
      {}
    );

  const categories =
    Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    );

  /* -------------------------------------------------------
     BUDGET TOTALS
  ------------------------------------------------------- */

  const totalBudget =
    budgetData.reduce(
      (sum, budget) =>
        sum +
        Number(budget.amount || 0),
      0
    );

  const totalBudgetSpent =
    budgetData.reduce(
      (sum, budget) =>
        sum +
        Number(
          categoryTotals[
            budget.name
          ] || 0
        ),
      0
    );

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="space-y-7">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-lg font-black text-mm-text sm:text-xl">
            Good morning, {user?.name || "there"}.
          </p>

          <h2 className="mt-1 text-3xl font-black">
            Your money at a glance
          </h2>

          <p className="mt-2 text-sm text-mm-muted">
            Your personal financial picture starts here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPage("income")} className="rounded-xl border border-mm-green/40 bg-mm-card px-4 py-3 text-sm font-black text-mm-green hover:bg-mm-green hover:text-mm-navy">+ Add income</button>
          <button onClick={() => setPage("expenses")} className="rounded-xl bg-mm-green px-4 py-3 text-sm font-black text-mm-navy hover:bg-mm-green-light">+ Add expense</button>
        </div>
      </section>

      {/* ===================================================
          MONEY CARDS
      =================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* BALANCE */}

        <MoneyCard
          label="Total balance"
          value={money(balance)}
          detail="Income minus expenses"
          green={balance >= 0}
          red={balance < 0}
        />

        {/* INCOME */}

        <MoneyCard
          label="Total income"
          value={`+${money(income)}`}
          detail={
            income
              ? "Income you added"
              : "No income added yet"
          }
          green
        />

        {/* EXPENSES */}

        <MoneyCard
          label="Total expenses"
          value={`-${money(expenses)}`}
          detail={
            expenses
              ? "Expenses you added"
              : "No expenses added yet"
          }
          red
        />

        {/* SAVINGS */}

        <MoneyCard
          label="Savings"
          value={money(
            Math.max(0, balance)
          )}
          detail="Available after expenses"
          green
        />
      </section>

      {/* ===================================================
          RECENT ACTIVITY + BUDGET HEALTH
      =================================================== */}

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        {/* -------------------------------------------------
            RECENT ACTIVITY
        ------------------------------------------------- */}

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black">
                Recent activity
              </h3>

              <p className="mt-1 text-sm text-mm-muted">
                Transactions you have recorded
              </p>
            </div>

            <button
              onClick={() =>
                setPage("expenses")
              }
              className="text-sm font-bold text-mm-green"
            >
              View all
            </button>
          </div>

          <div className="mt-5 divide-y divide-mm-border">
            {transactions.length ? (
              transactions.map(
                (item) => {
                  const isIncome =
                    item.type ===
                    "income";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-3.5"
                    >
                      {/* ICON */}

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mm-navy ${
                          isIncome
                            ? "text-mm-green"
                            : "text-red-400"
                        }`}
                      >
                        {isIncome
                          ? "↗"
                          : "↘"}
                      </span>

                      {/* INFORMATION */}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {item.name}
                        </p>

                        <p className="text-xs text-mm-muted">
                          {item.category ||
                            "Other"}{" "}
                          ·{" "}
                          {item.date ||
                            "Today"}
                        </p>
                      </div>

                      {/* AMOUNT */}

                      <p
                        className={`shrink-0 font-black ${
                          isIncome
                            ? "text-mm-green"
                            : "text-red-400"
                        }`}
                      >
                        {isIncome
                          ? "+"
                          : "-"}
                        {money(
                          item.amount
                        )}
                      </p>
                    </div>
                  );
                }
              )
            ) : (
              <p className="py-10 text-center text-sm text-mm-muted">
                No transactions yet.
                Add your first income
                or expense to begin.
              </p>
            )}
          </div>
        </div>

        {/* -------------------------------------------------
            BUDGET HEALTH
        ------------------------------------------------- */}

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-black">
                Budget health
              </h3>

              <p className="mt-1 text-sm text-mm-muted">
                {budgetData.length
                  ? "Your budget limits"
                  : "You have not created a budget yet."}
              </p>
            </div>

            {budgetData.length > 0 && (
              <button
                onClick={() =>
                  setPage("budgets")
                }
                className="text-xs font-bold text-mm-green"
              >
                Manage
              </button>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {budgetData.length ? (
              budgetData.map(
                (budget) => {
                  const limit =
                    Number(
                      budget.amount
                    ) || 0;

                  const spent =
                    Number(
                      categoryTotals[
                        budget.name
                      ] || 0
                    );

                  const percentage =
                    limit > 0
                      ? (spent /
                          limit) *
                        100
                      : 0;

                  const safePercentage =
                    Math.min(
                      100,
                      percentage
                    );

                  const overBudget =
                    spent > limit;

                  return (
                    <div
                      key={budget.id}
                    >
                      {/* TOP */}

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-bold">
                          {budget.name}
                        </span>

                        <span
                          className={
                            overBudget
                              ? "shrink-0 font-bold text-red-400"
                              : "shrink-0 text-mm-muted"
                          }
                        >
                          {money(spent)}{" "}
                          /{" "}
                          {money(limit)}
                        </span>
                      </div>

                      {/* BAR */}

                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mm-navy">
                        <div
                          className={`h-full rounded-full transition-all ${
                            overBudget
                              ? "bg-red-400"
                              : "bg-mm-green"
                          }`}
                          style={{
                            width: `${safePercentage}%`,
                          }}
                        />
                      </div>

                      {/* STATUS */}

                      <div className="mt-1.5 flex justify-between text-xs">
                        <span
                          className={
                            overBudget
                              ? "font-bold text-red-400"
                              : "text-mm-muted"
                          }
                        >
                          {percentage.toFixed(
                            1
                          )}
                          % used
                        </span>

                        <span
                          className={
                            overBudget
                              ? "font-bold text-red-400"
                              : "font-bold text-mm-green"
                          }
                        >
                          {overBudget
                            ? `${money(
                                spent -
                                  limit
                              )} over`
                            : `${money(
                                limit -
                                  spent
                              )} left`}
                        </span>
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <button
                onClick={() =>
                  setPage("budgets")
                }
                className="rounded-xl border border-mm-green/40 px-4 py-2.5 text-sm font-bold text-mm-green hover:bg-mm-green hover:text-mm-navy"
              >
                Create your first
                budget
              </button>
            )}
          </div>

          {/* TOTAL BUDGET SUMMARY */}

          {budgetData.length > 0 && (
            <div className="mt-6 rounded-xl bg-mm-navy p-4">
              <div className="flex justify-between text-xs">
                <span className="text-mm-muted">
                  Total budget
                </span>

                <span className="font-bold">
                  {money(
                    totalBudget
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-xs">
                <span className="text-mm-muted">
                  Total spent
                </span>

                <span className="font-bold text-red-400">
                  -{money(
                    totalBudgetSpent
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================
          DATA VISUALIZATION
      =================================================== */}

      <section className="grid gap-5 xl:grid-cols-2">
        {/* INCOME VS EXPENSE */}

        <IncomeExpenseChart
          income={
            financialData?.income ||
            []
          }
          expenses={
            financialData?.expenses ||
            []
          }
        />

        {/* EXPENSE PIE */}

        <ExpensePieChart
          expenses={
            financialData?.expenses ||
            []
          }
        />
      </section>

      {/* ===================================================
          SPENDING TREND
      =================================================== */}

      <section>
        <SpendingTrendChart
          expenses={
            financialData?.expenses ||
            []
          }
        />
      </section>

      {/* ===================================================
          MONTHLY INCOME VS EXPENSE
      =================================================== */}

      <section>
        <MonthlyIncomeExpenseChart
          income={
            financialData?.income ||
            []
          }
          expenses={
            financialData?.expenses ||
            []
          }
        />
      </section>

      {/* ===================================================
          EXPENSE CATEGORIES
      =================================================== */}

      <section className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black">
              Where your money went
            </h3>

            <p className="mt-1 text-sm text-mm-muted">
              Your expense categories
            </p>
          </div>

          <button
            onClick={() =>
              setPage("analytics")
            }
            className="text-sm font-bold text-mm-green"
          >
            Full analytics →
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {categories.length ? (
            categories.map(
              ([name, amount]) => {
                const percentage =
                  expenses > 0
                    ? (amount /
                        expenses) *
                      100
                    : 0;

                return (
                  <div
                    key={name}
                    className="rounded-xl bg-mm-navy p-4"
                  >
                    {/* NAME + AMOUNT */}

                    <div className="flex justify-between gap-3 text-sm">
                      <span className="truncate font-bold">
                        {name}
                      </span>

                      <span className="shrink-0 text-red-400">
                        -{money(amount)}
                      </span>
                    </div>

                    {/* PROGRESS */}

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-mm-card">
                      <div
                        className="h-full rounded-full bg-red-400 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    {/* PERCENTAGE */}

                    <p className="mt-2 text-xs text-mm-muted">
                      {percentage.toFixed(
                        1
                      )}
                      % of total expenses
                    </p>
                  </div>
                );
              }
            )
          ) : (
            <p className="rounded-xl bg-mm-navy p-5 text-sm text-mm-muted">
              Your category breakdown
              will appear after you
              add expenses.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
