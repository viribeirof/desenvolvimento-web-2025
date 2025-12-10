// authService.login
// authService.login
export const login = async (email, senha) => {
  const res = await fetch("http://localhost:8080/auth/login", {
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
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
