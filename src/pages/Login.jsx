import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // true = Login, false = Signup

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Google Auth
  const handleGoogleAuth = () => {
    window.location.href = "https://backend-app-chi-ten.vercel.app/auth/google";
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const { data } = await axios.post(
        "https://backend-app-chi-ten.vercel.app/auth/login",
        { email, password }
      );

      if (data.access_token) localStorage.setItem("token", data.access_token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login Successful!");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed!");
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("Signing up...");

    try {
      const { data } = await axios.post(
        "https://backend-app-chi-ten.vercel.app/auth/register",
        { name, email, password }
      );

      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.workspaces?.length > 0)
        localStorage.setItem("workspaceId", data.user.workspaces[0].id);

      if (data.token) localStorage.setItem("token", data.token);

      setMessage("Signup Successful!");
      navigate("/user");
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed!");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src="https://image.shutterstock.com/image-vector/background-game-cartoon-pixel-art-600nw-2604930167.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        alt="bg"
      />
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-sm p-8 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-white drop-shadow-md">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form
          className="space-y-4"
          onSubmit={isLogin ? handleLogin : handleSignup}
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl text-white placeholder-white bg-white/30 border border-white/40"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl text-white placeholder-white bg-white/30 border border-white/40"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl text-white placeholder-white bg-white/30 border border-white/40"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3 rounded-xl font-semibold text-gray-900 bg-white hover:bg-gray-100 transition shadow-md"
          >
            {isLogin ? "Log In with Google" : "Sign Up with Google"}
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <p className="mt-4 text-center text-white">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            className="text-yellow-300 font-semibold hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        <p className="mt-4 text-center text-white">{message}</p>
      </div>
    </div>
  );
};
