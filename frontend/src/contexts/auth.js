import { useState, useContext, createContext } from "react";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async () => {
    try {
      const resp = await fetch("https://api.chucklenuts.party/profile", {
        method: 'GET',
        credentials: 'include',
      })
      const json = await resp.json()
      if (json) {
        setUser(json);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login
      }}
    >
      {children}
    </AuthContext.Provider>
  )
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
