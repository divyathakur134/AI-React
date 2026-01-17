// src/actions/index.js

export async function explain(code, language) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/explain-code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Frontend fetch error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch",
    };
  }
}
