import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // ---------------- AXIOS INSTANCE ----------------
  const axiosInstance = axios.create({
    baseURL: "https://backend-app-chi-ten.vercel.app",
    headers: { "Content-Type": "application/json" },
  });

  // ---------------- NORMAL SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("Signing up...");

    try {
      const { data } = await axios.post(
        "https://backend-app-chi-ten.vercel.app/auth/register",

        {
          name,
          email,
          password,
        }
      );

      // Save user info from backend
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Save workspace id if exists
      if (data.user?.workspaces?.length > 0) {
        localStorage.setItem("workspaceId", data.user.workspaces[0].id);
      }

      // Save JWT token if provided
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setMessage("Signup Successful!");

      // Redirect to user page after signup
      setTimeout(() => {
        navigate("/user");
      }, 500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed!");
    }
  };

  // ---------------- GOOGLE SIGNUP ----------------
  const handleGoogleSignup = () => {
    window.location.href = "https://backend-app-chi-ten.vercel.app/auth/google";
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
          Create Account
        </h2>

        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl text-white placeholder-white bg-white/30 border border-white/40"
          />

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
            Sign Up
          </button>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full py-3 rounded-xl font-semibold text-gray-900 bg-white hover:bg-gray-100 transition shadow-md"
          >
            Sign Up with Google
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-yellow-300 font-semibold hover:underline"
          >
            Login
          </a>
        </p>

        <p className="mt-4 text-center text-white">{message}</p>
      </div>
    </div>
  );
};
