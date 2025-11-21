import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ---------------- NORMAL LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const { data } = await axios.post(
        "https://backend-app-chi-ten.vercel.app/auth/login",
        {
          email,
          password,
        }
      );
      console.log(data);

      // Save token
      if (data.access_token) localStorage.setItem("token", data.access_token);

      // Save user info
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Login successful!");
      // Redirect to user page
      navigate("/");
      console.log(data.access_token);
    } catch (err) {
      if (err.response && err.response.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Server error!");
      }
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
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
          Welcome Back
        </h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl text-white placeholder-white bg-white/30 border border-white/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl text-white placeholder-white bg-white/30 border border-white/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600"
          >
            Log In
          </button>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-xl font-semibold text-gray-900 bg-white hover:bg-gray-100 transition shadow-md"
          >
            Log In with Google
          </button>
        </form>

        <p className="mt-4 text-center text-white">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-yellow-300 font-semibold hover:underline"
          >
            Sign up
          </a>
        </p>

        <p className="mt-4 text-center text-white">{message}</p>
      </div>
    </div>
  );
};
