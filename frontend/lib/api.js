const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchWithFallback(endpoint, options = {}, fallbackData = null) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP Error ${res.status}` }));
      throw new Error(err.message || `Lỗi máy chủ (${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call to ${endpoint} failed: ${error.message}. Using client fallback if available.`);
    if (fallbackData !== null) {
      return { success: true, data: fallbackData, isFallback: true };
    }
    throw error;
  }
}
