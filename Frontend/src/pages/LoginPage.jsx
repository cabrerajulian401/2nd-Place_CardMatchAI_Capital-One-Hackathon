import { useState } from "react";
import {
  loginWithEmailPassword,
  loginWithGoogle,
  loginAnonymouslyUser,
} from "../firebase/authentication";

import { useAuth } from "../firebase/auth_context";
import { Navigate, useNavigate } from "react-router-dom";
useAuth
const Login = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate()

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await loginWithEmailPassword(email, password);
      console.log("Logged in with email:", userCredential.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
    nav('questionnaire')

  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loginWithGoogle();
      console.log("Logged in with Google:", result.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
    nav('questionnaire')
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loginAnonymouslyUser();
      console.log("Logged in anonymously:", result.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
    nav('questionnaire')

  };

  return (
    <>
    {user && (<Navigate to={'/questionnaire'}/>)}
    <section className="w-full h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Log In</h1>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              />
          </div>

          <div>
            <label className="text-gray-300 block mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-150"
            >
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition"
            >
            Continue with Google
          </button>

          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition"
            >
            Continue as Guest
          </button>
        </div>
      </div>
    </section>
    </>
  );
};

export default Login;
