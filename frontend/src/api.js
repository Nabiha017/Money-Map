const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://money-map-b98e.onrender.com";


async function request(path, options = {}) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  const data =
    response.status === 204
      ? null
      : await response.json();

  if (!response.ok) {
    console.error("API ERROR:", data);

    let errorMessage =
      "Something went wrong. Please try again.";

    if (typeof data?.detail === "string") {
      errorMessage = data.detail;
    } else if (data?.detail) {
      errorMessage = JSON.stringify(
        data.detail
      );
    } else if (data) {
      errorMessage = JSON.stringify(data);
    }

    throw new Error(errorMessage);
  }

  return data;
}


/* =========================================================
   AUTH
========================================================= */

export const registerUser = (details) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });


export const loginUser = (details) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(details),
  });

export const requestPasswordReset = (email, newPassword) =>
  request("/auth/dev-reset-password", {
    method: "POST",
    body: JSON.stringify({ email, new_password: newPassword }),
  });

export const resetPassword = (token, newPassword) =>
  request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });

export const changePassword = (newPassword, token) =>
  request("/auth/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ new_password: newPassword }),
  });

export const getCurrentUser = (token) =>
  request("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateCurrentUser = (details, token) =>
  request("/auth/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(details),
  });

export const resendVerification = (email) =>
  request(`/verification/send/${encodeURIComponent(email)}`, {
    method: "POST",
  });

export const verifyEmail = (token) =>
  request(`/verification/verify/${encodeURIComponent(token)}`);


/* =========================================================
   INCOME & EXPENSES
========================================================= */

export const listTransactions = (
  type,
  token
) =>
  request(`/transactions/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


export const createTransaction = (
  type,
  data,
  token
) =>
  request(
    `/transactions/${type}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );


export const updateTransaction = (
  type,
  id,
  data,
  token
) =>
  request(
    `/transactions/${type}/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );


export const deleteTransaction = (
  type,
  id,
  token
) =>
  request(
    `/transactions/${type}/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


/* =========================================================
   BUDGETS
========================================================= */

export const listBudgets = (token) =>
  request("/planning/budgets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


export const createBudget = (
  data,
  token
) =>
  request("/planning/budgets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });


export const updateBudget = (
  id,
  data,
  token
) =>
  request(`/planning/budgets/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });


export const deleteBudget = (
  id,
  token
) =>
  request(`/planning/budgets/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


/* =========================================================
   SAVINGS GOALS
========================================================= */

export const listGoals = (token) =>
  request("/planning/goals", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


export const createGoal = (
  data,
  token
) =>
  request("/planning/goals", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });


export const updateGoal = (
  id,
  data,
  token
) =>
  request(`/planning/goals/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });


export const deleteGoal = (
  id,
  token
) =>
  request(`/planning/goals/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
