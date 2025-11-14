// src/Pages/Auth.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post("/token/", {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
      } else {
        await api.post("/register/", {
          username: formData.username,
          password: formData.password,
          email: formData.email,
        });

        // Auto-login after registration
        const res = await api.post("/token/", {
          username: formData.username,
          password: formData.password,
        });
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
      }

      navigate("/feed"); // SPA redirect
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      <div
        className="hidden md:flex w-1/2 flex-col justify-center items-center text-white p-12 relative"
        style={{
          backgroundImage: "url('/front.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-5xl font-extrabold mb-6 text-[#86C232] tracking-wide">Vibely</h1>
        <p className="text-lg text-[#6B6E70] text-center max-w-md">
          Connect, express, and engage — your vibe starts here.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#fcfeff] p-8">
        <div className="w-full max-w-md bg-[#222629] rounded-2xl shadow-2xl p-8 border border-[#6B6E70]/30">
          <h2 className="text-center text-3xl font-bold my-6 text-[#86C232]">
            {isLogin ? "Welcome Back 👋" : "Join Vibely Today"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {!isLogin && (
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-[#474B4F] border-[#6B6E70] text-white placeholder-gray-400 focus:outline-none focus:border-[#86C232]"
              />
            )}
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input input-bordered w-full bg-[#474B4F] border-[#6B6E70] text-white placeholder-gray-400 focus:outline-none focus:border-[#86C232]"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input input-bordered w-full bg-[#474B4F] border-[#6B6E70] text-white placeholder-gray-400 focus:outline-none focus:border-[#86C232]"
            />

            <button
              type="submit"
              className="btn mt-4 bg-[#61892F] hover:bg-[#86C232] text-[#222629] font-semibold border-none transition-all duration-200"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              className="text-[#86C232] font-semibold hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "New here? Create an account" : "Already a member? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
