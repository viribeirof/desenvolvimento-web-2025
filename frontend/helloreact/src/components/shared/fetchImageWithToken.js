// fetchImageWithToken.js
export const fetchImageWithToken = async (rawUrl) => {
  // tenta locais comuns onde você pode guardar access token
  const readToken = () =>
    sessionStorage.getItem("at") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  const tryFetch = async (url, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return fetch(url, { headers, credentials: "include" });
  };

  const placeholder = "/placeholder.png";

  const token = readToken();
  if (!token) return placeholder;

  try {
    // primeira tentativa com token 
    let res = await tryFetch(rawUrl, token);

    // se 401 tenta refresh
    if (res.status === 401) {
      try {
        const refreshUrl = `${window.location.origin}/auth/refresh`; 
        const refreshRes = await fetch(refreshUrl, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshRes.ok) {
          const body = await refreshRes.json().catch(() => ({}));
          const newToken = body?.accessToken || body?.access_token || body?.token || null;

          if (newToken) {
            // salva novo token refaz a requisição
            try {
              sessionStorage.setItem("at", newToken);
              sessionStorage.setItem("accessToken", newToken);
              localStorage.setItem("accessToken", newToken);
            } catch (err) {
              console.warn("Não foi possível salvar novo token:", err);
            }
            res = await tryFetch(rawUrl, newToken);
          } else {
            res = await tryFetch(rawUrl, null);
          }
        } else {
          console.warn("Refresh falhou ao buscar imagem:", refreshRes.status);
          return placeholder;
        }
      } catch (err) {
        console.warn("Erro ao tentar refresh para imagem:", err);
        return placeholder;
      }
    }

    if (!res.ok) {
      console.warn("fetchImageWithToken: resposta não ok", res.status, res.statusText);
      return placeholder;
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn("fetchImageWithToken error:", err);
    return placeholder;
  }
};
