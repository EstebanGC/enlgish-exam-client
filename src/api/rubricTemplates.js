const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function handleResponse(response) {
  if (response.status === 204) return null;
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

export async function listRubricTemplates() {
  const response = await fetch(`${API_BASE_URL}/rubric-templates/`);
  return handleResponse(response);
}

export async function createRubricTemplate(payload) {
  const response = await fetch(`${API_BASE_URL}/rubric-templates/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteRubricTemplate(id) {
  const response = await fetch(`${API_BASE_URL}/rubric-templates/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}