import { API_BASE_URL } from "./api";
export const login = async (email, senha) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.messages?.[0] || data.erro || data.error || "Falha no login";
    throw new Error(message);
  }

  // salva access token no session storage
  sessionStorage.setItem('at', data.accessToken);
  return data;
};


export const logout = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};
