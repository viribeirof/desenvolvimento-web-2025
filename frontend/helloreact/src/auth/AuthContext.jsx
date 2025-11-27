import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; 
import * as authService from "../api/AuthService"; 
const AuthContext = createContext({
    user: null,
    setUser: () => { },
    authLoading: true,
});

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("at");

        if (!token) {
            setUser(null);
            setAuthLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                // token expirado
                localStorage.removeItem("token");
                setUser(null);
            } else {
                setUser(decoded);
            }
        } catch (err) {
            console.error("Token inválido:", err);
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }, []);
    const logout = () => {
        authService.logout(); // limpa storage
        setUser(null);        // atualiza estado
    };
    return (
        <AuthContext.Provider value={{ user, setUser, authLoading, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
