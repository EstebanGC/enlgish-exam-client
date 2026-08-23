const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && typeof data.detail === "string" && data.detail) ||
      (data && Array.isArray(data.detail) && data.detail.map((d) => d.msg).join(" | ")) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function getEvaluationHistory() {
  const response = await fetch(`${API_BASE_URL}/history/evaluations`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getSpeakingHistory() {
  const response = await fetch(`${API_BASE_URL}/history/speaking`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getHistorySummary() {
  const response = await fetch(`${API_BASE_URL}/history/summary`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}