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
      if (resp.status === 200 && json) {
        setUser(json);
        setIsAuthenticated(true);
      } else {
        setUser({
          name: "guest",
          email: "guest@gmail.com",
          profile_image: "",
          preferences: {}
        })
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
      
      setUser({
        name: "guest",
        email: "guest@gmail.com",
        profile_image: "",
        preferences: {}
      })
      setIsAuthenticated(true);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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
