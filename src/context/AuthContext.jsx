import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("examproUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    let loggedInUser = null;

    if (email === "admin@exampro.com" && password === "admin123") {
      loggedInUser = {
        name: "ExamPro Admin",
        email: email,
        role: "admin",
      };
    } else if (
      email === "student@exampro.com" &&
      password === "student123"
    ) {
      loggedInUser = {
        name: "Demo Student",
        email: email,
        role: "student",
      };
    }

    if (!loggedInUser) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    localStorage.setItem("examproUser", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  const register = (name, email, password) => {
    const existingUsers =
      JSON.parse(localStorage.getItem("examproUsers")) || [];

    const userExists = existingUsers.some(
      (existingUser) => existingUser.email === email
    );

    if (userExists) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role: "student",
    };

    existingUsers.push(newUser);

    localStorage.setItem(
      "examproUsers",
      JSON.stringify(existingUsers)
    );

    return {
      success: true,
      message: "Registration successful.",
    };
  };

  const logout = () => {
    localStorage.removeItem("examproUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);