import React, { useState } from "react";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUserPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

const AuthPage: React.FC = () => {
  const { login, register, isLoading: authIsLoading } = useAuth(); // Get login, register, and isLoading from context

  const [isLoginView, setIsLoginView] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // For registration
  const [confirmPassword, setConfirmPassword] = useState(""); // For registration

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext will handle redirecting or App.tsx will re-render based on isAuthenticated
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      setIsLoginView(true);
      setEmail(email); // Pre-fill email for login
      setPassword("");
      setConfirmPassword("");
      setUsername("");
      alert("Registration successful! Please log in."); // Simple feedback
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const currentLoading = loading || authIsLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <img src={logo} alt="Chat App Logo" className="w-24 h-24 mb-8" />
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to my gigaChat</h1>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-400">
          {isLoginView ? "Sign In" : "Create Account"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-sm">
            {error}
          </div>
        )}

        {isLoginView ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="email-login" className="block text-sm font-medium text-gray-300">Email</label>
              <input 
                type="email" 
                name="email-login" 
                id="email-login" 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-150 ease-in-out"
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={currentLoading}
              />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-gray-300">Password</label>
              <input 
                type="password" 
                name="password-login" 
                id="password-login" 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-150 ease-in-out"
                placeholder="********" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={currentLoading}
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentLoading}
              >
                {currentLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />} 
                {currentLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="username-register" className="block text-sm font-medium text-gray-300">Username</label>
              <input 
                type="text" 
                name="username-register" 
                id="username-register" 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-150 ease-in-out"
                placeholder="YourUsername" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={currentLoading}
              />
            </div>
            <div>
              <label htmlFor="email-register" className="block text-sm font-medium text-gray-300">Email</label>
              <input 
                type="email" 
                name="email-register" 
                id="email-register" 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-150 ease-in-out"
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={currentLoading}
              />
            </div>
            <div>
              <label htmlFor="password-register" className="block text-sm font-medium text-gray-300">Password</label>
              <input 
                type="password" 
                name="password-register" 
                id="password-register" 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-150 ease-in-out"
                placeholder="********" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={currentLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password-register" className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <input 
                type="password" 
                name="confirm-password-register" 
                id="confirm-password-register" 
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-150 ease-in-out"
                placeholder="********" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={currentLoading}
              />
            </div>
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentLoading}
              >
                {currentLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faUserPlus} className="mr-2" />} 
                {currentLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(null); }} 
              className="font-medium text-indigo-400 hover:text-indigo-300 ml-1 focus:outline-none disabled:opacity-50"
              disabled={currentLoading}
            >
              {isLoginView ? "Register here" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
      <p className="mt-8 text-xs text-gray-500 text-center">
        &copy; {new Date().getFullYear()} Converse App. All rights reserved.
      </p>
    </div>
  );
};

export default AuthPage;

