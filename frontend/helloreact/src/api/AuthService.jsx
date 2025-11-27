// authService.login
export const login = async (email, senha) => {
  const res = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ email, senha })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.messages?.[0] || err.error || err.erro || "Falha no login";
    throw new Error(message);
  }
  const data = await res.json();
  // salva access token (sessionStorage recomendado)
  sessionStorage.setItem('at', data.accessToken);
  return data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
