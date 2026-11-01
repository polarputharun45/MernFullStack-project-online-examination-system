
import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // LOAD SAVED USER
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("examproUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  // SAVE BACKEND USER AND JWT TOKEN
  const setBackendUser = (loggedInUser, token) => {
    localStorage.setItem(
      "examproUser",
      JSON.stringify(loggedInUser)
    );

    if (token) {
      localStorage.setItem("examproToken", token);
    }

    setUser(loggedInUser);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("examproUser");
    localStorage.removeItem("examproToken");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setBackendUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
