const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
 
export async function submitEvaluation(payload) {
  const token = localStorage.getItem("access_token");
 
  const response = await fetch(`${API_BASE_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
 
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
 