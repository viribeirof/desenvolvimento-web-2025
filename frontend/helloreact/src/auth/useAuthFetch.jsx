import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_REFRESH_PATH = "http://localhost:8080/auth/refresh";

const useAuthFetch = ({ refreshPath = DEFAULT_REFRESH_PATH, withCredentials = true } = {}) => {
  const navigate = useNavigate();

  const authFetch = useCallback(
    async (url, fetchOptions = {}) => {
      if (!url) {
        const err = new Error("useAuthFetch: url is required");
        console.error(err);
        throw err;
      }

      const { signal, headers: originalHeaders, withCredentials: optWithCredentials, ...rest } = fetchOptions;
      const useCredentials = typeof optWithCredentials === "boolean" ? optWithCredentials : withCredentials;
      //Primeira tentativa
      let headers;
      try {
        headers = new Headers(originalHeaders || {});
      } catch (e) {
        headers = new Headers();
        if (originalHeaders && typeof originalHeaders === "object") {
          Object.entries(originalHeaders).forEach(([k, v]) => headers.set(k, v));
        }
      }

      const accessToken =
        sessionStorage.getItem("at") ||
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

      const baseOptions = {
        ...rest,
        signal,
      };

      const doFetch = async (fetchUrl, opts) => {
        console.debug("[authFetch] request", { fetchUrl, opts: { ...opts, body: opts?.body ? "[body]" : undefined } });

        try {
          const response = await fetch(fetchUrl, opts);
          console.debug("[authFetch] response", { status: response.status, ok: response.ok, url: response.url });
          return response;
        } catch (err) {
          console.error("[authFetch] network/fetch error", err);
          throw err; 
        }
      };

      const fetchUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

      let res;
      try {
        res = await doFetch(fetchUrl, {
          ...baseOptions,
          headers,
          credentials: useCredentials ? "include" : undefined,
        });
      } catch (err) {
        throw err;
      }

      if (res.status !== 401) return res;

      // 401: tenta refresh
      const refreshUrl = refreshPath.startsWith("http") ? refreshPath : `${window.location.origin}${refreshPath}`;
      let refreshRes;
      try {
        refreshRes = await doFetch(refreshUrl, {
          method: "POST",
          credentials: "include",
          signal,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        // falha de rede no refresh limpa token e redireciona
        sessionStorage.removeItem("at");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
        throw err;
      }

      if (!refreshRes.ok) {
        // refresh inválido limpa e redireciona
        sessionStorage.removeItem("at");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
        return res;
      }

      const refreshBody = await refreshRes.json().catch(() => ({}));
      const newToken = refreshBody?.accessToken || refreshBody?.access_token || refreshBody?.token || null;

      if (!newToken) {
        sessionStorage.removeItem("at");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
        return res;
      }

      // salvo token novo
      try {
        sessionStorage.setItem("at", newToken);
        sessionStorage.setItem("accessToken", newToken);
        localStorage.setItem("accessToken", newToken);
      } catch (e) {
        console.warn("[authFetch] não foi possível salvar token:", e);
      }

      headers.set("Authorization", `Bearer ${newToken}`);

      // segunda tentativa (após refresh)
      try {
        const retryRes = await doFetch(fetchUrl, {
          ...baseOptions,
          headers,
          credentials: useCredentials ? "include" : undefined,
        });
        return retryRes;
      } catch (err) {
        console.error("[authFetch] erro na segunda tentativa", err);
        throw err;
      }
    },
    [navigate, refreshPath, withCredentials]
  );

  return authFetch;
};

export { useAuthFetch };
