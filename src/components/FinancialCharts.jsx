import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

/* =========================================================
   MONEY FORMAT
========================================================= */

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

/* =========================================================
   CATEGORY COLORS
========================================================= */

const CATEGORY_COLORS = {
  Home: "#3B82F6",
  "Food & dining": "#F97316",
  "Food & Dining": "#F97316",
  Transport: "#A855F7",
  Shopping: "#EC4899",
  Bills: "#EAB308",
  Entertainment: "#06B6D4",
  Healthcare: "#14B8A6",
  Education: "#6366F1",
  Other: "#64748B",
};

/* =========================================================
   GET REAL EXPENSE CATEGORY
========================================================= */

function getRealCategory(expense) {
  const category = String(
    expense.category || ""
  ).trim();

  /*
    These are generic categories that should
    NOT become a pie-chart slice.
  */

  const genericCategories = [
    "",
    "Expense",
    "Expenses",
  ];

  if (
    !genericCategories.includes(category)
  ) {
    return category;
  }

  /*
    Try to find the actual category from
    name / description.
  */

  const name = String(
    expense.name ||
      expense.description ||
      ""
  ).trim();

  const knownCategories = [
    "Home",
    "Food & dining",
    "Food & Dining",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
  ];

  const matchedCategory =
    knownCategories.find(
      (item) =>
        item.toLowerCase() ===
        name.toLowerCase()
    );

  if (matchedCategory) {
    return matchedCategory;
  }

  /*
    If there is no known category,
    put it under Other.
  */

  return "Other";
}

/* =========================================================
   EXPENSE BREAKDOWN DONUT CHART
========================================================= */

export function ExpensePieChart({
  expenses = [],
}) {
  const categoryTotals =
    expenses.reduce(
      (result, expense) => {
        const category =
          getRealCategory(expense);

        const amount =
          Number(expense.amount || 0);

        result[category] =
          (result[category] || 0) +
          amount;

        return result;
      },
      {}
    );

  const data = Object.entries(
    categoryTotals
  )
    .map(([name, value]) => ({
      name,
      value,
    }))
    .filter(
      (item) => item.value > 0
    )
    .sort(
      (a, b) => b.value - a.value
    );

  const total = data.reduce(
    (sum, item) =>
      sum + item.value,
    0
  );

  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">

      {/* HEADER */}

      <div>
        <h3 className="text-lg font-black">
          Expense breakdown
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          See exactly where your money is going.
        </p>
      </div>

      {data.length ? (
        <>
          {/* DONUT */}

          <div className="relative mt-4 h-[330px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={78}
                  outerRadius={115}
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="#071A2E"
                  strokeWidth={4}
                >

                  {data.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          CATEGORY_COLORS[
                            entry.name
                          ] ||
                          CATEGORY_COLORS.Other
                        }
                      />
                    )
                  )}

                </Pie>

                {/* TOOLTIP */}

                <Tooltip
                  formatter={(value) =>
                    formatMoney(value)
                  }
                  contentStyle={{
                    backgroundColor:
                      "#071A2E",
                    border:
                      "1px solid #263449",
                    borderRadius:
                      "12px",
                    color: "#FFFFFF",
                    padding:
                      "10px 14px",
                  }}
                  labelStyle={{
                    color:
                      "#FFFFFF",
                  }}
                  itemStyle={{
                    color:
                      "#FFFFFF",
                    fontWeight:
                      700,
                  }}
                />

                {/* LEGEND */}

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize:
                      "12px",
                    paddingTop:
                      "15px",
                  }}
                />

              </PieChart>
            </ResponsiveContainer>

            {/* CENTER VALUE */}

            <div className="pointer-events-none absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 text-center">

              <p className="text-xs text-mm-muted">
                Total
              </p>

              <p className="mt-1 whitespace-nowrap text-2xl font-black text-white">
                {formatMoney(total)}
              </p>

            </div>

          </div>

          {/* CATEGORY DETAILS */}

          <div className="mt-4 space-y-2">

            {data.map((item) => {
              const percentage =
                total > 0
                  ? (item.value /
                      total) *
                    100
                  : 0;

              const categoryColor =
                CATEGORY_COLORS[
                  item.name
                ] ||
                CATEGORY_COLORS.Other;

              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-xl bg-mm-navy px-3 py-3"
                >

                  {/* COLOR */}

                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        categoryColor,
                    }}
                  />

                  {/* CATEGORY */}

                  <p className="min-w-0 flex-1 truncate text-sm font-bold">
                    {item.name}
                  </p>

                  {/* PERCENTAGE */}

                  <p className="text-xs text-mm-muted">
                    {percentage.toFixed(
                      1
                    )}
                    %
                  </p>

                  {/* AMOUNT */}

                  <p className="text-sm font-black text-red-400">
                    -{formatMoney(
                      item.value
                    )}
                  </p>

                </div>
              );
            })}

          </div>
        </>
      ) : (
        <div className="flex h-[330px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mm-navy text-3xl">
              🥧
            </div>

            <p className="mt-4 font-black">
              No expense data yet
            </p>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-mm-muted">
              Add expenses to see your spending breakdown.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   INCOME VS EXPENSES BAR CHART
========================================================= */

export function IncomeExpenseChart({
  income = [],
  expenses = [],
}) {
  const totalIncome =
    income.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  const totalExpenses =
    expenses.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  const data = [
    {
      name: "Income",
      amount: totalIncome,
    },
    {
      name: "Expenses",
      amount: totalExpenses,
    },
  ];

  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">

      {/* HEADER */}

      <div>
        <h3 className="text-lg font-black">
          Income vs expenses
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          Compare money coming in with money going out.
        </p>
      </div>

      {/* BAR CHART */}

      <div className="mt-5 h-[300px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#263449"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{
                fill: "#94A3B8",
                fontSize: 12,
              }}
              axisLine={{
                stroke: "#263449",
              }}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value >= 1000
                  ? `₹${(
                      value / 1000
                    ).toFixed(0)}k`
                  : `₹${value}`
              }
            />

            <Tooltip
              formatter={(value) =>
                formatMoney(value)
              }
              contentStyle={{
                backgroundColor:
                  "#071A2E",
                border:
                  "1px solid #263449",
                borderRadius:
                  "12px",
              }}
              labelStyle={{
                color:
                  "#FFFFFF",
              }}
              itemStyle={{
                color:
                  "#FFFFFF",
              }}
            />

            <Bar
              dataKey="amount"
              name="Amount"
              radius={[
                10,
                10,
                0,
                0,
              ]}
            >

              {/* GREEN INCOME */}

              <Cell
                fill="#22C55E"
              />

              {/* RED EXPENSE */}

              <Cell
                fill="#EF4444"
              />

            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-mm-navy p-4">

          <p className="text-xs text-mm-muted">
            Money coming in
          </p>

          <p className="mt-1 text-lg font-black text-mm-green">
            +{formatMoney(
              totalIncome
            )}
          </p>

        </div>

        <div className="rounded-xl bg-mm-navy p-4">

          <p className="text-xs text-mm-muted">
            Money going out
          </p>

          <p className="mt-1 text-lg font-black text-red-400">
            -{formatMoney(
              totalExpenses
            )}
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   SPENDING TREND
========================================================= */

export function SpendingTrendChart({
  expenses = [],
}) {
  const dailyTotals = {};

  expenses.forEach((expense) => {
    const date =
      expense.date ||
      "Unknown";

    dailyTotals[date] =
      (dailyTotals[date] || 0) +
      Number(expense.amount || 0);
  });

  const data = Object.entries(
    dailyTotals
  )
    .sort(([a], [b]) =>
      a.localeCompare(b)
    )
    .map(([date, amount]) => ({
      date,
      amount,
    }));

  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">

      {/* HEADER */}

      <div>
        <h3 className="text-lg font-black">
          Spending trend
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          Track how your expenses change over time.
        </p>
      </div>

      {data.length > 1 ? (
        <div className="mt-5 h-[300px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#263449"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fill: "#94A3B8",
                  fontSize: 11,
                }}
                axisLine={{
                  stroke: "#263449",
                }}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: "#94A3B8",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  value >= 1000
                    ? `₹${(
                        value / 1000
                      ).toFixed(0)}k`
                    : `₹${value}`
                }
              />

              <Tooltip
                formatter={(value) =>
                  formatMoney(value)
                }
                contentStyle={{
                  backgroundColor:
                    "#071A2E",
                  border:
                    "1px solid #263449",
                  borderRadius:
                    "12px",
                }}
                labelStyle={{
                  color:
                    "#FFFFFF",
                }}
                itemStyle={{
                  color:
                    "#FFFFFF",
                }}
              />

              <Line
                type="monotone"
                dataKey="amount"
                name="Expenses"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#EF4444",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 7,
                }}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>
      ) : (
        <div className="flex h-[300px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mm-navy text-2xl">
              📈
            </div>

            <p className="mt-4 font-bold">
              More data needed
            </p>

            <p className="mt-1 text-sm text-mm-muted">
              Add expenses on different dates to see a spending trend.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   MONTHLY INCOME VS EXPENSE
========================================================= */

export function MonthlyIncomeExpenseChart({
  income = [],
  expenses = [],
}) {
  const monthlyData = {};

  /* -------------------------------------------------------
     PROCESS INCOME
  ------------------------------------------------------- */

  income.forEach((item) => {
    const date = item.date
      ? new Date(item.date)
      : new Date();

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const monthKey =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    const month =
      date.toLocaleString(
        "en-IN",
        {
          month: "short",
        }
      );

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month,
        income: 0,
        expenses: 0,
      };
    }

    monthlyData[
      monthKey
    ].income +=
      Number(item.amount || 0);
  });

  /* -------------------------------------------------------
     PROCESS EXPENSES
  ------------------------------------------------------- */

  expenses.forEach((item) => {
    const date = item.date
      ? new Date(item.date)
      : new Date();

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const monthKey =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    const month =
      date.toLocaleString(
        "en-IN",
        {
          month: "short",
        }
      );

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month,
        income: 0,
        expenses: 0,
      };
    }

    monthlyData[
      monthKey
    ].expenses +=
      Number(item.amount || 0);
  });

  /* -------------------------------------------------------
     SORT MONTHS
  ------------------------------------------------------- */

  const data = Object.entries(
    monthlyData
  )
    .sort(([a], [b]) =>
      a.localeCompare(b)
    )
    .map(([key, value]) => ({
      ...value,
      key,
    }));

  /* -------------------------------------------------------
     TOTALS
  ------------------------------------------------------- */

  const totalIncome =
    income.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  const totalExpenses =
    expenses.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  return (
    <div className="rounded-2xl border border-mm-border bg-mm-card p-5 sm:p-6">

      {/* HEADER */}

      <div>
        <h3 className="text-lg font-black">
          Monthly cash flow
        </h3>

        <p className="mt-1 text-sm text-mm-muted">
          Compare your income and expenses month by month.
        </p>
      </div>

      {data.length ? (
        <>

          {/* CHART */}

          <div className="mt-5 h-[330px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#263449"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke: "#263449",
                  }}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `₹${(
                          value / 1000
                        ).toFixed(0)}k`
                      : `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatMoney(value)
                  }
                  contentStyle={{
                    backgroundColor:
                      "#071A2E",
                    border:
                      "1px solid #263449",
                    borderRadius:
                      "12px",
                  }}
                  labelStyle={{
                    color:
                      "#FFFFFF",
                    fontWeight:
                      700,
                  }}
                  itemStyle={{
                    color:
                      "#FFFFFF",
                  }}
                />

                <Legend />

                {/* INCOME LINE */}

                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#22C55E",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />

                {/* EXPENSE LINE */}

                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#EF4444",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

          {/* SUMMARY */}

          <div className="grid gap-3 sm:grid-cols-2">

            <div className="rounded-xl bg-mm-navy p-4">

              <p className="text-xs text-mm-muted">
                Total income
              </p>

              <p className="mt-1 text-lg font-black text-mm-green">
                +{formatMoney(
                  totalIncome
                )}
              </p>

            </div>

            <div className="rounded-xl bg-mm-navy p-4">

              <p className="text-xs text-mm-muted">
                Total expenses
              </p>

              <p className="mt-1 text-lg font-black text-red-400">
                -{formatMoney(
                  totalExpenses
                )}
              </p>

            </div>

          </div>

        </>
      ) : (
        <div className="flex h-[330px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mm-navy text-2xl">
              📊
            </div>

            <p className="mt-4 font-black">
              No financial data yet
            </p>

            <p className="mt-1 text-sm text-mm-muted">
              Add income and expenses to see your monthly cash flow.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}