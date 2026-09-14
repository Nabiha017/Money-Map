import { useEffect, useMemo, useState } from "react";

import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createBudget,
  updateBudget,
  deleteBudget,
  createGoal,
  updateGoal,
  deleteGoal,
  listBudgets,
  listGoals,
} from "../api";


/* =========================================================
   BASIC CONTENT
========================================================= */

const content = {
  income: {
    eyebrow: "Cash flow",
    title: "Income",
    description: "Record every source of money coming in.",
    action: "Add income",
  },

  expenses: {
    eyebrow: "Cash flow",
    title: "Expenses",
    description:
      "Track spending and keep categories under control.",
    action: "Add expense",
  },
};


/* =========================================================
   MONEY
========================================================= */

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;


/* =========================================================
   CATEGORY TOTALS
========================================================= */

function getCategoryTotals(expenses = []) {
  return expenses.reduce((totals, expense) => {
    const category = expense.category || "Other";

    totals[category] =
      (totals[category] || 0) +
      Number(expense.amount || 0);

    return totals;
  }, {});
}


function getTopCategory(expenses = []) {
  const totals = getCategoryTotals(expenses);

  const entries = Object.entries(totals);

  if (!entries.length) {
    return null;
  }

  entries.sort((a, b) => b[1] - a[1]);

  return {
    name: entries[0][0],
    amount: entries[0][1],
  };
}


/* =========================================================
   NORMAL ENTRY DIALOG
========================================================= */

function EntryDialog({
  type,
  onClose,
  onSave,
  editingItem,
}) {
  const isIncome = type === "income";

  const [name, setName] = useState(
    editingItem?.name || ""
  );

  const [amount, setAmount] = useState(
    editingItem?.amount || ""
  );

  const [category, setCategory] = useState(
    editingItem?.category ||
      (isIncome ? "Salary" : "Other")
  );

  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    onSave({
      id: editingItem?.id,

      name: name.trim(),

      category,

      date:
        editingItem?.date ||
        new Date().toISOString().slice(0, 10),

      amount: Number(amount),
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-mm-border bg-mm-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-black">
              {editingItem
                ? `Edit ${
                    isIncome ? "income" : "expense"
                  }`
                : isIncome
                  ? "Add income"
                  : "Add expense"}
            </h3>

            <p className="mt-1 text-sm text-mm-muted">
              Enter the details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-mm-muted hover:text-white"
          >
            ×
          </button>
        </div>

        <label className="mt-6 block text-sm font-bold">
          {isIncome
            ? "Income source"
            : "Expense description"}

          <input
            autoFocus
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder={
              isIncome
                ? "e.g. Salary"
                : "e.g. Groceries"
            }
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          />
        </label>

        <label className="mt-4 block text-sm font-bold">
          Category

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          >
            {isIncome ? (
              <>
                <option>Salary</option>
                <option>Freelance</option>
                <option>Business</option>
                <option>Other income</option>
              </>
            ) : (
              <>
                <option>Other</option>
                <option>Home</option>
                <option>Food & dining</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Entertainment</option>
                <option>Healthcare</option>
                <option>Education</option>
              </>
            )}
          </select>
        </label>

        <label className="mt-4 block text-sm font-bold">
          Amount

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="0"
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 font-bold text-mm-muted hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-mm-green px-4 py-2.5 font-black text-mm-navy hover:bg-mm-green-light"
          >
            {editingItem ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}


/* =========================================================
   BUDGET DIALOG
========================================================= */

function BudgetDialog({
  editingBudget,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(
    editingBudget?.name || ""
  );

  const [amount, setAmount] = useState(
    editingBudget?.amount || ""
  );

  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    if (!name) {
      setError("Please select a category.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    onSave({
      id: editingBudget?.id,
      name,
      amount: Number(amount),
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-mm-border bg-mm-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-black">
              {editingBudget
                ? "Edit budget"
                : "Create budget"}
            </h3>

            <p className="mt-1 text-sm text-mm-muted">
              Set your monthly spending limit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-mm-muted hover:text-white"
          >
            ×
          </button>
        </div>

        <label className="mt-6 block text-sm font-bold">
          Budget category

          <select
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          >
            <option value="">
              Select category
            </option>
            <option>Home</option>
            <option>Food & dining</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Other</option>
          </select>
        </label>

        <label className="mt-4 block text-sm font-bold">
          Monthly limit

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="₹0"
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 font-bold text-mm-muted"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-mm-green px-4 py-2.5 font-black text-mm-navy"
          >
            {editingBudget
              ? "Update"
              : "Create budget"}
          </button>
        </div>
      </form>
    </div>
  );
}


/* =========================================================
   GOAL DIALOG
========================================================= */

function GoalDialog({
  editingGoal,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(
    editingGoal?.name || ""
  );

  const [amount, setAmount] = useState(
    editingGoal?.amount || ""
  );

  const [saved, setSaved] = useState(
    editingGoal?.saved || ""
  );

  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    const target = Number(amount);
    const currentSaved = Number(saved || 0);

    if (!name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (!target || target <= 0) {
      setError("Please enter a valid target.");
      return;
    }

    if (currentSaved < 0) {
      setError("Saved amount cannot be negative.");
      return;
    }

    if (currentSaved > target) {
      setError(
        "Saved amount cannot be greater than the target."
      );
      return;
    }

    onSave({
      id: editingGoal?.id,
      name: name.trim(),
      amount: target,
      saved: currentSaved,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-mm-border bg-mm-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-black">
              {editingGoal
                ? "Edit savings goal"
                : "Create savings goal"}
            </h3>

            <p className="mt-1 text-sm text-mm-muted">
              Set your target and current savings.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-mm-muted hover:text-white"
          >
            ×
          </button>
        </div>

        <label className="mt-6 block text-sm font-bold">
          Goal name

          <input
            autoFocus
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. New laptop"
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          />
        </label>

        <label className="mt-4 block text-sm font-bold">
          Target amount

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            placeholder="₹0"
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          />
        </label>

        <label className="mt-4 block text-sm font-bold">
          Already saved

          <input
            type="number"
            min="0"
            value={saved}
            onChange={(event) =>
              setSaved(event.target.value)
            }
            placeholder="₹0"
            className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 font-bold text-mm-muted"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-mm-green px-4 py-2.5 font-black text-mm-navy"
          >
            {editingGoal
              ? "Update goal"
              : "Create goal"}
          </button>
        </div>
      </form>
    </div>
  );
}


/* =========================================================
   SAVINGS GOALS
========================================================= */

function SavingsGoalsPage({
  financialData,
  setFinancialData,
  token,
}) {
  const [dialog, setDialog] = useState(false);
  const [editingGoal, setEditingGoal] =
    useState(null);
  const [error, setError] = useState("");

  const goals =
    financialData?.savings || [];

  const totalTarget = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.amount || 0),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) =>
      sum + Number(goal.saved || 0),
    0
  );

  async function saveGoal(goal) {
    try {
      setError("");

      let result;

      if (goal.id) {
        result = await updateGoal(
          goal.id,
          {
            name: goal.name,
            amount: goal.amount,
            saved: goal.saved,
          },
          token
        );
      } else {
        result = await createGoal(
          {
            name: goal.name,
            amount: goal.amount,
            saved: goal.saved,
          },
          token
        );
      }

      const clientGoal = {
        id: result.id,
        name: result.name,
        amount: result.amount,
        saved: result.saved,
      };

      setFinancialData((current) => {
        const existing =
          current?.savings || [];

        const exists = existing.some(
          (item) =>
            item.id === clientGoal.id
        );

        return {
          ...current,
          savings: exists
            ? existing.map((item) =>
                item.id === clientGoal.id
                  ? clientGoal
                  : item
              )
            : [
                clientGoal,
                ...existing,
              ],
        };
      });

      setDialog(false);
      setEditingGoal(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeGoal(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this savings goal?"
      )
    ) {
      return;
    }

    try {
      await deleteGoal(id, token);

      setFinancialData((current) => ({
        ...current,
        savings: (
          current?.savings || []
        ).filter(
          (goal) =>
            goal.id !== id
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-mm-green">
            PLAN AHEAD
          </p>

          <h2 className="mt-1 text-3xl font-black">
            Savings Goals
          </h2>

          <p className="mt-2 text-mm-muted">
            Turn your financial goals into measurable progress.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setDialog(true);
          }}
          className="rounded-xl bg-mm-green px-4 py-3 text-sm font-black text-mm-navy"
        >
          + Create goal
        </button>
      </header>

      {error && (
        <div className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Active goals
          </p>

          <p className="mt-2 text-3xl font-black">
            {goals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Total saved
          </p>

          <p className="mt-2 text-3xl font-black text-mm-green">
            {formatMoney(totalSaved)}
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Total target
          </p>

          <p className="mt-2 text-3xl font-black">
            {formatMoney(totalTarget)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">
        <h3 className="font-black">
          Your savings goals
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          Track how close you are to each goal.
        </p>

        <div className="mt-6 space-y-5">
          {goals.length ? (
            goals.map((goal) => {
              const target =
                Number(goal.amount) || 0;

              const saved =
                Number(goal.saved) || 0;

              const percentage =
                target > 0
                  ? (saved / target) * 100
                  : 0;

              const safePercentage =
                Math.min(
                  100,
                  Math.max(
                    0,
                    percentage
                  )
                );

              const remaining =
                Math.max(
                  0,
                  target - saved
                );

              const completed =
                saved >= target;

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-mm-border bg-mm-navy p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mm-green/10 text-xl text-mm-green">
                        {completed
                          ? "✓"
                          : "◎"}
                      </div>

                      <div>
                        <h4 className="font-black">
                          {goal.name}
                        </h4>

                        <p className="text-xs text-mm-muted">
                          Savings goal
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setDialog(true);
                        }}
                        className="rounded-lg border border-mm-border px-3 py-2 text-xs font-bold text-mm-muted"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          removeGoal(goal.id)
                        }
                        className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-bold text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-mm-muted">
                        Saved
                      </p>

                      <p className="mt-1 text-2xl font-black text-mm-green">
                        {formatMoney(saved)}
                      </p>
                    </div>

                    <p className="text-sm text-mm-muted">
                      of{" "}
                      <span className="font-bold text-white">
                        {formatMoney(target)}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="h-3 overflow-hidden rounded-full bg-mm-card">
                      <div
                        className="h-full rounded-full bg-mm-green transition-all"
                        style={{
                          width: `${safePercentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-xs">
                      <span className="font-bold text-mm-green">
                        {percentage.toFixed(1)}%
                        complete
                      </span>

                      <span className="text-mm-muted">
                        {completed
                          ? "Goal reached 🎉"
                          : `${formatMoney(
                              remaining
                            )} remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-mm-border p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mm-green/10 text-3xl">
                🎯
              </div>

              <h3 className="mt-4 font-black">
                No savings goals yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-mm-muted">
                Create a goal for something important and start tracking your progress.
              </p>

              <button
                onClick={() => {
                  setEditingGoal(null);
                  setDialog(true);
                }}
                className="mt-5 rounded-xl bg-mm-green px-4 py-2.5 text-sm font-black text-mm-navy"
              >
                Create your first goal
              </button>
            </div>
          )}
        </div>
      </section>

      {dialog && (
        <GoalDialog
          editingGoal={editingGoal}
          onClose={() => {
            setDialog(false);
            setEditingGoal(null);
          }}
          onSave={saveGoal}
        />
      )}
    </div>
  );
}


/* =========================================================
   BUDGETS
========================================================= */

function BudgetPage({
  financialData,
  setFinancialData,
  token,
}) {
  const [dialog, setDialog] = useState(false);
  const [editingBudget, setEditingBudget] =
    useState(null);
  const [error, setError] = useState("");

  const budgets =
    financialData?.budgets || [];

  const categoryTotals = useMemo(
    () => getCategoryTotals(financialData?.expenses ?? []),
    [financialData?.expenses]
  );

  async function saveBudget(budget) {
    try {
      setError("");

      let result;

      if (budget.id) {
        result = await updateBudget(
          budget.id,
          {
            name: budget.name,
            amount: budget.amount,
          },
          token
        );
      } else {
        result = await createBudget(
          {
            name: budget.name,
            amount: budget.amount,
          },
          token
        );
      }

      const clientBudget = {
        id: result.id,
        name: result.name,
        amount: result.amount,
      };

      setFinancialData((current) => {
        const existing =
          current?.budgets || [];

        const exists = existing.some(
          (item) =>
            item.id === clientBudget.id
        );

        return {
          ...current,
          budgets: exists
            ? existing.map((item) =>
                item.id === clientBudget.id
                  ? clientBudget
                  : item
              )
            : [
                clientBudget,
                ...existing,
              ],
        };
      });

      setDialog(false);
      setEditingBudget(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeBudget(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this budget?"
      )
    ) {
      return;
    }

    try {
      await deleteBudget(id, token);

      setFinancialData((current) => ({
        ...current,
        budgets: (
          current?.budgets || []
        ).filter(
          (budget) =>
            budget.id !== id
        ),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-mm-green">
            PLAN AHEAD
          </p>

          <h2 className="mt-1 text-3xl font-black">
            Budgets
          </h2>

          <p className="mt-2 text-mm-muted">
            Set monthly limits and keep your spending on track.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setDialog(true);
          }}
          className="rounded-xl bg-mm-green px-4 py-3 text-sm font-black text-mm-navy"
        >
          + Create budget
        </button>
      </header>

      {error && (
        <div className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Active budgets
          </p>

          <p className="mt-2 text-3xl font-black">
            {budgets.length}
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Total budget
          </p>

          <p className="mt-2 text-3xl font-black text-mm-green">
            {formatMoney(
              budgets.reduce(
                (sum, budget) =>
                  sum +
                  Number(
                    budget.amount || 0
                  ),
                0
              )
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Total spent
          </p>

          <p className="mt-2 text-3xl font-black text-red-400">
            -
            {formatMoney(
              budgets.reduce(
                (sum, budget) =>
                  sum +
                  Number(
                    categoryTotals[
                      budget.name
                    ] || 0
                  ),
                0
              )
            )}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">
        <h3 className="font-black">
          Monthly budgets
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          Spending is calculated from your recorded expenses.
        </p>

        <div className="mt-6 space-y-4">
          {budgets.length ? (
            budgets.map((budget) => {
              const limit =
                Number(budget.amount) || 0;

              const spent =
                Number(
                  categoryTotals[
                    budget.name
                  ] || 0
                );

              const percentage =
                limit > 0
                  ? (spent / limit) * 100
                  : 0;

              const overBudget =
                spent > limit;

              const remaining =
                limit - spent;

              return (
                <div
                  key={budget.id}
                  className="rounded-2xl border border-mm-border bg-mm-navy p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-black">
                        {budget.name}
                      </h4>

                      <p className="text-xs text-mm-muted">
                        Monthly budget
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBudget(
                            budget
                          );
                          setDialog(true);
                        }}
                        className="rounded-lg border border-mm-border px-3 py-2 text-xs font-bold text-mm-muted"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          removeBudget(
                            budget.id
                          )
                        }
                        className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-bold text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-mm-muted">
                        Spent
                      </p>

                      <p
                        className={`text-2xl font-black ${
                          overBudget
                            ? "text-red-400"
                            : "text-mm-green"
                        }`}
                      >
                        {formatMoney(spent)}
                      </p>
                    </div>

                    <p className="text-sm text-mm-muted">
                      of{" "}
                      <span className="font-bold text-white">
                        {formatMoney(limit)}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-mm-card">
                    <div
                      className={`h-full rounded-full ${
                        overBudget
                          ? "bg-red-400"
                          : "bg-mm-green"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            percentage
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-mm-muted">
                      {percentage.toFixed(1)}%
                      used
                    </span>

                    <span
                      className={
                        overBudget
                          ? "font-bold text-red-400"
                          : "font-bold text-mm-green"
                      }
                    >
                      {overBudget
                        ? `${formatMoney(
                            Math.abs(
                              remaining
                            )
                          )} over budget`
                        : `${formatMoney(
                            remaining
                          )} remaining`}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-mm-border p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mm-green/10 text-2xl">
                ▣
              </div>

              <h3 className="mt-4 font-black">
                No budgets yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-mm-muted">
                Create a monthly budget to keep your spending under control.
              </p>

              <button
                onClick={() => {
                  setEditingBudget(null);
                  setDialog(true);
                }}
                className="mt-5 rounded-xl bg-mm-green px-4 py-2.5 text-sm font-black text-mm-navy"
              >
                Create your first budget
              </button>
            </div>
          )}
        </div>
      </section>

      {dialog && (
        <BudgetDialog
          editingBudget={editingBudget}
          onClose={() => {
            setDialog(false);
            setEditingBudget(null);
          }}
          onSave={saveBudget}
        />
      )}
    </div>
  );
}


/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsPage({
  financialData,
}) {
  const expenses =
    financialData?.expenses || [];

  const totalExpenses =
    expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const categoryTotals =
    getCategoryTotals(expenses);

  const topCategory =
    getTopCategory(expenses);

  const percentage =
    totalExpenses > 0 && topCategory
      ? (topCategory.amount /
          totalExpenses) *
        100
      : 0;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm text-mm-green">
          INTELLIGENCE
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Analytics
        </h2>

        <p className="mt-2 text-mm-muted">
          See how your spending changes over time.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-3xl border border-mm-border bg-mm-card p-6 sm:p-8">
          <p className="text-xs font-black tracking-[.16em] text-mm-green">
            MONEYMAP SIGNAL
          </p>

          {topCategory ? (
            <>
              <h3 className="mt-3 text-2xl font-black">
                Your highest-spend category is{" "}
                {topCategory.name}
              </h3>

              <p className="mt-2 text-5xl font-black text-mm-green">
                {formatMoney(
                  topCategory.amount
                )}
              </p>

              <p className="mt-5 leading-7 text-mm-muted">
                {topCategory.name} accounts for{" "}
                {percentage.toFixed(1)}%
                of your total expenses.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-3 text-2xl font-black">
                No expense data yet
              </h3>

              <p className="mt-2 text-5xl font-black text-mm-green">
                ₹0
              </p>

              <p className="mt-5 leading-7 text-mm-muted">
                Add expenses and MoneyMap will calculate your spending patterns.
              </p>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-mm-border bg-mm-card p-6">
          <h3 className="font-black">
            Spending summary
          </h3>

          <p className="mt-1 text-sm text-mm-muted">
            Based on your current expenses
          </p>

          <p className="mt-6 text-3xl font-black text-red-400">
            -{formatMoney(totalExpenses)}
          </p>

          <div className="mt-6 space-y-4">
            {Object.entries(categoryTotals)
              .sort(
                (a, b) => b[1] - a[1]
              )
              .map(([category, amount]) => {
                const width =
                  totalExpenses > 0
                    ? (amount /
                        totalExpenses) *
                      100
                    : 0;

                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">
                        {category}
                      </span>

                      <span className="text-red-400">
                        {formatMoney(amount)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-mm-navy">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}


/* =========================================================
   FINANCIAL HEALTH
========================================================= */

function FinancialHealthPage({
  financialData,
}) {
  const income =
    (financialData?.income || []).reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const expenses =
    (financialData?.expenses || []).reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const budgets =
    financialData?.budgets || [];

  const savings =
    financialData?.savings || [];

  const balance =
    income - expenses;

  const savingsRate =
    income > 0
      ? Math.max(
          0,
          (balance / income) * 100
        )
      : 0;

  const expenseRate =
    income > 0
      ? (expenses / income) * 100
      : 0;

  const budgetResults =
    budgets.map((budget) => {
      const spent =
        (financialData?.expenses || [])
          .filter(
            (expense) =>
              String(
                expense.category || ""
              ).toLowerCase() ===
              String(
                budget.name || ""
              ).toLowerCase()
          )
          .reduce(
            (sum, expense) =>
              sum +
              Number(
                expense.amount || 0
              ),
            0
          );

      const limit =
        Number(
          budget.amount || 0
        );

      return {
        ...budget,
        spent,
        limit,
        percentage:
          limit > 0
            ? (spent / limit) * 100
            : 0,
      };
    });

  const budgetsOnTrack =
    budgetResults.filter(
      (budget) =>
        budget.limit > 0 &&
        budget.percentage <= 80
    ).length;

  const goalProgress =
    savings.map((goal) => {
      const target =
        Number(goal.amount || 0);

      const saved =
        Number(goal.saved || 0);

      return target > 0
        ? Math.min(
            100,
            (saved / target) * 100
          )
        : 0;
    });

  const averageGoalProgress =
    goalProgress.length
      ? goalProgress.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / goalProgress.length
      : 0;

  let score = 50;

  if (income > 0) {
    if (balance > 0) score += 15;
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10)
      score += 8;

    if (expenseRate <= 70)
      score += 10;
    else if (expenseRate <= 85)
      score += 5;
  }

  if (
    budgets.length > 0 &&
    budgetsOnTrack === budgets.length
  ) {
    score += 5;
  }

  if (
    averageGoalProgress >= 50
  ) {
    score += 5;
  }

  score = Math.min(100, score);

  let status = "Needs attention";

  if (score >= 80) {
    status = "Excellent";
  } else if (score >= 65) {
    status = "Healthy";
  } else if (score >= 50) {
    status = "Fair";
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm text-mm-green">
          INTELLIGENCE
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Financial Health
        </h2>

        <p className="mt-2 text-mm-muted">
          Understand your overall financial position.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-3xl border border-mm-border bg-mm-card p-7 text-center">
          <p className="text-sm text-mm-muted">
            Your financial health score
          </p>

          <p className="mt-4 text-7xl font-black text-mm-green">
            {score}
          </p>

          <p className="mt-2 text-xl font-black">
            {status}
          </p>

          <p className="mt-4 text-sm leading-6 text-mm-muted">
            Your score is based on your income,
            expenses, savings rate, budgets and
            savings goals.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
            <p className="text-sm text-mm-muted">
              Total income
            </p>

            <p className="mt-2 text-3xl font-black text-mm-green">
              {formatMoney(income)}
            </p>
          </div>

          <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
            <p className="text-sm text-mm-muted">
              Total expenses
            </p>

            <p className="mt-2 text-3xl font-black text-red-400">
              {formatMoney(expenses)}
            </p>
          </div>

          <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
            <p className="text-sm text-mm-muted">
              Available balance
            </p>

            <p
              className={`mt-2 text-3xl font-black ${
                balance >= 0
                  ? "text-mm-green"
                  : "text-red-400"
              }`}
            >
              {formatMoney(balance)}
            </p>
          </div>

          <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
            <p className="text-sm text-mm-muted">
              Savings rate
            </p>

            <p className="mt-2 text-3xl font-black text-mm-green">
              {savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Expense rate
          </p>

          <p className="mt-2 text-3xl font-black">
            {expenseRate.toFixed(1)}%
          </p>

          <p className="mt-2 text-xs text-mm-muted">
            Percentage of income spent.
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Budgets on track
          </p>

          <p className="mt-2 text-3xl font-black text-mm-green">
            {budgetsOnTrack}/{budgets.length}
          </p>

          <p className="mt-2 text-xs text-mm-muted">
            Budgets using 80% or less.
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Goal progress
          </p>

          <p className="mt-2 text-3xl font-black text-mm-green">
            {averageGoalProgress.toFixed(1)}%
          </p>

          <p className="mt-2 text-xs text-mm-muted">
            Average progress across goals.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-mm-border bg-mm-card p-6">
        <h3 className="font-black">
          Health overview
        </h3>

        <div className="mt-5 space-y-5">
          <div>
            <div className="flex justify-between text-sm">
              <span>Income used for expenses</span>
              <span className="font-bold">
                {expenseRate.toFixed(1)}%
              </span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-mm-navy">
              <div
                className="h-full rounded-full bg-mm-green"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      expenseRate
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm">
              <span>Average savings goal progress</span>
              <span className="font-bold">
                {averageGoalProgress.toFixed(1)}%
              </span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-mm-navy">
              <div
                className="h-full rounded-full bg-mm-green"
                style={{
                  width: `${averageGoalProgress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   WHAT-IF SIMULATOR
========================================================= */

function WhatIfSimulator({
  financialData,
}) {
  const [itemName, setItemName] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [saved, setSaved] =
    useState("");

  const [monthlySaving, setMonthlySaving] =
    useState("");

  const [hasSimulated, setHasSimulated] =
    useState(false);

  const [error, setError] =
    useState("");

  const income =
    (financialData?.income || []).reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const expenses =
    (financialData?.expenses || []).reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const balance =
    income - expenses;

  const target =
    Number(price) || 0;

  const currentSaved =
    Number(saved) || 0;

  const monthly =
    Number(monthlySaving) || 0;

  const remaining =
    Math.max(
      0,
      target - currentSaved
    );

  const canAfford =
    target > 0 &&
    currentSaved >= target;

  const monthsNeeded =
    remaining > 0 && monthly > 0
      ? Math.ceil(
          remaining / monthly
        )
      : 0;

  const afterPurchase =
    balance - target;

  const usage =
    balance > 0
      ? (target / balance) * 100
      : 0;

  const recommended =
    remaining > 0
      ? Math.ceil(
          remaining / 6
        )
      : 0;

  const purchaseDate =
    new Date();

  if (monthsNeeded > 0) {
    purchaseDate.setMonth(
      purchaseDate.getMonth() +
        monthsNeeded
    );
  }

  const estimatedMonth =
    purchaseDate.toLocaleString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  function calculate(event) {
    event.preventDefault();

    setError("");

    if (!itemName.trim()) {
      setError(
        "Please enter what you want to buy."
      );
      return;
    }

    if (!target) {
      setError(
        "Please enter a valid target amount."
      );
      return;
    }

    if (
      !canAfford &&
      monthly <= 0
    ) {
      setError(
        "Please enter how much you can save each month."
      );
      return;
    }

    setHasSimulated(true);
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-bold text-mm-green">
          DECISION TOOL
        </p>

        <h2 className="mt-1 text-3xl font-black">
          What-If Simulator
        </h2>

        <p className="mt-2 text-mm-muted">
          Find out whether you can afford something now,
          or how long you need to save for it.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <form
          onSubmit={calculate}
          className="rounded-3xl border border-mm-border bg-mm-card p-6"
        >
          <h3 className="font-black">
            Plan a purchase
          </h3>

          <label className="mt-6 block text-sm font-bold">
            What do you want to buy?

            <input
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                setHasSimulated(false);
              }}
              placeholder="e.g. New Laptop"
              className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
            />
          </label>

          <label className="mt-4 block text-sm font-bold">
            Price / target amount

            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setHasSimulated(false);
              }}
              placeholder="80,000"
              className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
            />
          </label>

          <label className="mt-4 block text-sm font-bold">
            Already saved

            <input
              type="number"
              min="0"
              value={saved}
              onChange={(e) => {
                setSaved(e.target.value);
                setHasSimulated(false);
              }}
              placeholder="20,000"
              className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
            />
          </label>

          <label className="mt-4 block text-sm font-bold">
            Monthly saving

            <input
              type="number"
              min="0"
              value={monthlySaving}
              onChange={(e) => {
                setMonthlySaving(
                  e.target.value
                );
                setHasSimulated(false);
              }}
              placeholder="10,000"
              className="mt-2 w-full rounded-xl border border-mm-border bg-mm-navy px-4 py-3 outline-none focus:border-mm-green"
            />
          </label>

          {error && (
            <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-mm-green px-4 py-3 font-black text-mm-navy"
          >
            Calculate my plan
          </button>
        </form>

        <div className="rounded-3xl border border-mm-border bg-mm-card p-6">
          <p className="text-xs font-black tracking-[.16em] text-mm-green">
            BEFORE YOU BUY
          </p>

          <h3 className="mt-3 text-2xl font-black">
            Your current financial position
          </h3>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-mm-navy p-5">
              <p className="text-sm text-mm-muted">
                Total income
              </p>

              <p className="mt-2 text-2xl font-black text-mm-green">
                +{formatMoney(income)}
              </p>
            </div>

            <div className="rounded-2xl bg-mm-navy p-5">
              <p className="text-sm text-mm-muted">
                Total expenses
              </p>

              <p className="mt-2 text-2xl font-black text-red-400">
                -{formatMoney(expenses)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-mm-green/5 p-5">
            <p className="text-sm text-mm-muted">
              Available balance
            </p>

            <p className="mt-2 text-4xl font-black text-mm-green">
              {formatMoney(balance)}
            </p>
          </div>
        </div>
      </section>

      {hasSimulated && !error && (
        <section className="space-y-5">
          <div>
            <p className="text-xs font-black tracking-[.16em] text-mm-green">
              SIMULATION RESULT
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Can you afford the {itemName}?
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-mm-border bg-mm-card p-6">
              <p className="text-sm text-mm-muted">
                BEFORE
              </p>

              <p className="mt-2 text-3xl font-black text-mm-green">
                {formatMoney(balance)}
              </p>
            </div>

            <div className="rounded-3xl border border-mm-border bg-mm-card p-6">
              <p className="text-sm text-mm-muted">
                AFTER BUYING
              </p>

              <p
                className={`mt-2 text-3xl font-black ${
                  afterPurchase >= 0
                    ? "text-mm-green"
                    : "text-red-400"
                }`}
              >
                {formatMoney(
                  afterPurchase
                )}
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-6 ${
              canAfford
                ? "border-mm-green/30 bg-mm-green/5"
                : "border-red-400/30 bg-red-400/5"
            }`}
          >
            <h3
              className={`text-lg font-black ${
                canAfford
                  ? "text-mm-green"
                  : "text-red-400"
              }`}
            >
              {canAfford
                ? "You can afford this purchase"
                : "You cannot afford this yet"}
            </h3>

            <p className="mt-2 leading-7 text-mm-muted">
              {canAfford
                ? `You already have ${formatMoney(
                    currentSaved
                  )} saved for this purchase.`
                : `You need ${formatMoney(
                    remaining
                  )} more before reaching your target.`}
            </p>
          </div>

          {!canAfford && (
            <div className="rounded-3xl border border-mm-border bg-mm-card p-6">
              <h3 className="font-black">
                Your saving timeline
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-mm-navy p-5">
                  <p className="text-sm text-mm-muted">
                    Still needed
                  </p>

                  <p className="mt-1 text-2xl font-black text-red-400">
                    {formatMoney(
                      remaining
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-mm-navy p-5">
                  <p className="text-sm text-mm-muted">
                    Monthly saving
                  </p>

                  <p className="mt-1 text-2xl font-black text-mm-green">
                    {formatMoney(monthly)}
                  </p>
                </div>

                <div className="rounded-2xl bg-mm-navy p-5">
                  <p className="text-sm text-mm-muted">
                    Time needed
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {monthsNeeded}{" "}
                    {monthsNeeded === 1
                      ? "month"
                      : "months"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-mm-green/5 p-5">
                <p className="text-sm text-mm-muted">
                  Estimated affordable month
                </p>

                <p className="mt-1 text-2xl font-black text-mm-green">
                  {estimatedMonth}
                </p>
              </div>
            </div>
          )}

          {balance > 0 && (
            <div className="rounded-3xl border border-mm-border bg-mm-card p-6">
              <p className="text-sm text-mm-muted">
                This purchase uses
              </p>

              <p className="mt-1 text-3xl font-black text-red-400">
                {Math.min(
                  100,
                  Math.max(0, usage)
                ).toFixed(1)}
                %
              </p>

              <p className="mt-1 text-sm text-mm-muted">
                of your available balance.
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-mm-navy">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, usage)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {!canAfford && (
            <div className="rounded-3xl border border-mm-border bg-mm-card p-6">
              <h3 className="font-black">
                MoneyMap recommendation
              </h3>

              <p className="mt-4 leading-7 text-mm-muted">
                If you want to reach this target in
                about 6 months, try saving:
              </p>

              <p className="mt-2 text-2xl font-black text-mm-green">
                {formatMoney(
                  recommended
                )}{" "}
                / month
              </p>
            </div>
          )}
        </section>
      )}

      {!hasSimulated && (
        <section className="rounded-3xl border border-dashed border-mm-border bg-mm-card p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mm-green/10 text-3xl">
            🔮
          </div>

          <h3 className="mt-5 text-xl font-black">
            Before you buy, check the impact
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-mm-muted">
            Enter something you want to buy and MoneyMap
            will tell you whether you can afford it,
            how much you still need, and how many months
            you may need to save.
          </p>
        </section>
      )}

      <p className="text-center text-xs text-mm-muted">
        This is a simulation only. Your actual income,
        expenses, and savings are not changed.
      </p>
    </div>
  );
}


/* =========================================================
   NORMAL TRANSACTIONS PAGE
========================================================= */

function TransactionsPage({
  page,
  financialData,
  setFinancialData,
  token,
}) {
  const [dialog, setDialog] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  const [error, setError] =
    useState("");

  const standard =
    content[page];

  const items =
    financialData?.[page] || [];

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  async function saveItem(item) {
    try {
      setError("");

      const type =
        page === "income"
          ? "income"
          : "expenses";

      const data =
        page === "income"
          ? {
              description:
                item.name,
              source:
                item.category,
              date: item.date,
              amount: item.amount,
            }
          : {
              description:
                item.name,
              category:
                item.category,
              date: item.date,
              amount: item.amount,
            };

      let result;

      if (item.id) {
        result =
          await updateTransaction(
            type,
            item.id,
            data,
            token
          );
      } else {
        result =
          await createTransaction(
            type,
            data,
            token
          );
      }

      const clientItem = {
        id: result.id,
        name:
          result.description,
        category:
          page === "income"
            ? result.source
            : result.category,
        date: result.date,
        amount: result.amount,
      };

      setFinancialData(
        (current) => {
          const existing =
            current?.[page] || [];

          const exists =
            existing.some(
              (oldItem) =>
                oldItem.id ===
                clientItem.id
            );

          return {
            ...current,

            [page]: exists
              ? existing.map(
                  (oldItem) =>
                    oldItem.id ===
                    clientItem.id
                      ? clientItem
                      : oldItem
                )
              : [
                  clientItem,
                  ...existing,
                ],
          };
        }
      );

      setDialog(false);
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(id) {
    if (
      !window.confirm(
        `Delete this ${
          page === "income"
            ? "income"
            : "expense"
        }?`
      )
    ) {
      return;
    }

    try {
      await deleteTransaction(
        page === "income"
          ? "income"
          : "expenses",
        id,
        token
      );

      setFinancialData(
        (current) => ({
          ...current,

          [page]: (
            current?.[page] || []
          ).filter(
            (item) =>
              item.id !== id
          ),
        })
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-mm-green">
            {standard.eyebrow.toUpperCase()}
          </p>

          <h2 className="mt-1 text-3xl font-black">
            {standard.title}
          </h2>

          <p className="mt-2 text-mm-muted">
            {standard.description}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setDialog(true);
          }}
          className="rounded-xl bg-mm-green px-4 py-3 text-sm font-black text-mm-navy"
        >
          + {standard.action}
        </button>
      </header>

      {error && (
        <div className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Your entries
          </p>

          <p className="mt-2 text-3xl font-black">
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Total amount
          </p>

          <p
            className={`mt-2 text-3xl font-black ${
              page === "income"
                ? "text-mm-green"
                : "text-red-400"
            }`}
          >
            {page === "income"
              ? "+"
              : "-"}
            {formatMoney(total)}
          </p>
        </div>

        <div className="rounded-2xl border border-mm-border bg-mm-card p-5">
          <p className="text-sm text-mm-muted">
            Last updated
          </p>

          <p className="mt-2 text-3xl font-black">
            Today
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">
        <h3 className="font-black">
          {standard.title} overview
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          Your saved transactions appear here.
        </p>

        <div className="mt-5 divide-y divide-mm-border">
          {items.length ? (
            items.map((item) => {
              const isIncome =
                page === "income";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-mm-navy ${
                      isIncome
                        ? "text-mm-green"
                        : "text-red-400"
                    }`}
                  >
                    {isIncome
                      ? "↗"
                      : "↘"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {item.name}
                    </p>

                    <p className="text-sm text-mm-muted">
                      {item.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`font-black ${
                          isIncome
                            ? "text-mm-green"
                            : "text-red-400"
                        }`}
                      >
                        {isIncome
                          ? "+"
                          : "-"}
                        {formatMoney(
                          item.amount
                        )}
                      </p>

                      <p className="text-xs text-mm-muted">
                        {item.date}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setDialog(true);
                      }}
                      className="rounded-lg border border-mm-border px-2.5 py-1.5 text-xs font-bold text-mm-muted"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                      className="rounded-lg border border-red-400/20 px-2.5 py-1.5 text-xs font-bold text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-10 text-center text-sm text-mm-muted">
              No entries yet. Use the button above to
              add your first one.
            </p>
          )}
        </div>
      </section>

      {dialog && (
        <EntryDialog
          type={page}
          editingItem={editingItem}
          onClose={() => {
            setDialog(false);
            setEditingItem(null);
          }}
          onSave={saveItem}
        />
      )}
    </div>
  );
}


/* =========================================================
   MAIN FEATURE PAGE
========================================================= */

export default function FeaturePage({
  page,
  financialData,
  setFinancialData,
}) {
  const token =
    localStorage.getItem(
      "moneymap-token"
    );

  /* =======================================================
     LOAD BUDGETS + GOALS
  ======================================================= */

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    async function loadPlanningData() {
      try {
        const [budgets, goals] =
          await Promise.all([
            listBudgets(token),
            listGoals(token),
          ]);

        if (cancelled) {
          return;
        }

        setFinancialData(
          (current) => ({
            ...current,

            budgets:
              budgets.map(
                (budget) => ({
                  id: budget.id,
                  name: budget.name,
                  amount:
                    budget.amount,
                })
              ),

            savings:
              goals.map(
                (goal) => ({
                  id: goal.id,
                  name: goal.name,
                  amount:
                    goal.amount,
                  saved:
                    goal.saved,
                })
              ),
          })
        );

      } catch (err) {
        if (!cancelled) {
          console.error("Unable to load planning data:", err);
        }
      }
    }

    loadPlanningData();

    return () => {
      cancelled = true;
    };
  }, [token, setFinancialData]);


  /* =======================================================
     SIMULATOR
  ======================================================= */

  if (page === "simulator") {
    return (
      <WhatIfSimulator
        financialData={
          financialData
        }
      />
    );
  }


  /* =======================================================
     FINANCIAL HEALTH
  ======================================================= */

  if (
    page === "financial-health"
  ) {
    return (
      <FinancialHealthPage
        financialData={
          financialData
        }
      />
    );
  }


  /* =======================================================
     ANALYTICS
  ======================================================= */

  if (page === "analytics") {
    return (
      <AnalyticsPage
        financialData={
          financialData
        }
      />
    );
  }


  /* =======================================================
     OTHER INTELLIGENCE
  ======================================================= */

  if (
    [
      "patterns",
      "leaks",
      "unusual",
      "predictions",
      "insights",
    ].includes(page)
  ) {
    const expenses =
      financialData?.expenses || [];

    const total =
      expenses.reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

    const top =
      getTopCategory(
        expenses
      );

    let title = "Insights";
    let lead = "Add expenses to receive insights.";
    let number = "₹0";
    let body =
      "MoneyMap will analyse your recorded expenses.";

    if (page === "patterns") {
      title =
        "Spending Patterns";

      lead = expenses.length
        ? `Your average expense is ${formatMoney(
            total /
              expenses.length
          )}`
        : "Not enough data yet";

      number = expenses.length
        ? formatMoney(
            total /
              expenses.length
          )
        : "₹0";

      body =
        "This is calculated from your recorded expenses.";
    }

    if (page === "leaks") {
      title =
        "Financial Leaks";

      const small =
        expenses.filter(
          (item) =>
            Number(
              item.amount || 0
            ) <= 1000
        );

      const leak =
        small.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        );

      lead = small.length
        ? "Small purchases are adding up"
        : "No financial leaks detected yet";

      number =
        formatMoney(leak);

      body = small.length
        ? `${small.length} small expense${
            small.length === 1
              ? ""
              : "s"
          } currently account for ${formatMoney(
            leak
          )}.`
        : "Add expenses to discover possible leaks.";
    }

    if (page === "unusual") {
      title =
        "Unusual Expenses";

      const average =
        expenses.length
          ? total /
            expenses.length
          : 0;

      const unusual =
        expenses.filter(
          (item) =>
            Number(
              item.amount || 0
            ) >
            average * 2
        );

      lead = unusual.length
        ? `${unusual.length} unusual expense${
            unusual.length ===
            1
              ? ""
              : "s"
          } found`
        : "No unusual expenses found";

      number =
        unusual.length
          ? formatMoney(
              Math.max(
                ...unusual.map(
                  (item) =>
                    Number(
                      item.amount ||
                        0
                    )
                )
              )
            )
          : "₹0";

      body =
        "Unusual expenses are transactions that are more than twice your current average.";
    }

    if (page === "predictions") {
      title = "Predictions";
      const monthly = expenses.reduce((totals, item) => {
        const month = String(item.date || "").slice(0, 7);
        if (month) totals[month] = (totals[month] || 0) + Number(item.amount || 0);
        return totals;
      }, {});
      const history = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b));

      if (history.length < 2) {
        lead = "Not enough spending history yet";
        number = "—";
        body = "Add expenses in at least two different months to receive a personalized next-month spending estimate.";
      } else {
        const values = history.map(([, amount]) => amount);
        const changes = values.slice(1).map((amount, index) => amount - values[index]);
        const averageChange = changes.reduce((sum, value) => sum + value, 0) / changes.length;
        const predicted = Math.max(0, values[values.length - 1] + averageChange);
        lead = "Estimated spending next month";
        number = formatMoney(predicted);
        body = `Based on your recorded spending from ${history.length} months. Your average month-to-month change is ${formatMoney(Math.abs(averageChange))} ${averageChange >= 0 ? "upward" : "downward"}.`;
      }
    }

    if (page === "insights") {
      title =
        "Personalized Insights";

      lead = top
        ? `${top.name} is your biggest spending category`
        : "Add expenses to receive insights";

      number = top
        ? formatMoney(
            top.amount
          )
        : "₹0";

      body = top
        ? `MoneyMap found ${top.name} as your highest spending category.`
        : "Add expenses and MoneyMap will generate insights.";
    }

    return (
      <div className="space-y-7">
        <header>
          <p className="text-sm text-mm-green">
            INTELLIGENCE
          </p>

          <h2 className="mt-1 text-3xl font-black">
            {title}
          </h2>

          <p className="mt-2 text-mm-muted">
            Insights based on your financial activity.
          </p>
        </header>

        <section className="rounded-3xl border border-mm-border bg-mm-card p-7">
          <p className="text-xs font-black tracking-[.16em] text-mm-green">
            MONEYMAP SIGNAL
          </p>

          <h3 className="mt-3 text-2xl font-black">
            {lead}
          </h3>

          <p className="mt-3 text-5xl font-black text-mm-green">
            {number}
          </p>

          <p className="mt-5 max-w-2xl leading-7 text-mm-muted">
            {body}
          </p>
        </section>
      </div>
    );
  }


  /* =======================================================
     BUDGETS
  ======================================================= */

  if (page === "budgets") {
    return (
      <BudgetPage
        financialData={
          financialData
        }
        setFinancialData={
          setFinancialData
        }
        token={token}
      />
    );
  }


  /* =======================================================
     SAVINGS
  ======================================================= */

  if (page === "savings") {
    return (
      <SavingsGoalsPage
        financialData={
          financialData
        }
        setFinancialData={
          setFinancialData
        }
        token={token}
      />
    );
  }


  /* =======================================================
     INCOME / EXPENSES
  ======================================================= */

  if (
    page === "income" ||
    page === "expenses"
  ) {
    return (
      <TransactionsPage
        page={page}
        financialData={
          financialData
        }
        setFinancialData={
          setFinancialData
        }
        token={token}
      />
    );
  }


  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card p-8">
      <p className="text-sm text-mm-green">
        MONEYMAP
      </p>

      <h2 className="mt-2 text-3xl font-black">
        Feature not found
      </h2>

      <p className="mt-3 text-mm-muted">
        Please select a feature from the sidebar.
      </p>
    </div>
  );
}
