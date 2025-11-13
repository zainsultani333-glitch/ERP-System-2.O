import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "../Api/AxiosInstance";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", { email, password });
      console.log(res);

      if (res?.status === 200) {
        toast.success("Login successful!");

        navigate("/company-selection")
        login(res.data.user, res.data.token);


      } else {
        toast.error(res.data?.message || "Invalid credentials");
      }
    } catch (error) {

      toast.error(
        error.response?.data?.message || "Something went wrong while logging in"
      );


    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      {/* ERP-themed Background Image with Overlay */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" fill="none"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%230ea5e9;stop-opacity:1" /><stop offset="100%" style="stop-color:%238b5cf6;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="800" fill="url(%23grad1)"/><g fill="white" fill-opacity="0.1"><circle cx="200" cy="150" r="80"/><circle cx="1000" cy="650" r="120"/><rect x="400" y="100" width="300" height="200" rx="20"/><rect x="150" y="500" width="250" height="150" rx="15"/><rect x="800" y="200" width="350" height="250" rx="25"/><path d="M500 600 L700 600 L700 700 L500 700 Z" rx="10"/><path d="M300 300 L450 300 L450 400 L300 400 Z" rx="8"/></g><g stroke="white" stroke-width="2" stroke-opacity="0.2" fill="none"><line x1="50" y1="50" x2="1150" y2="50"/><line x1="50" y1="750" x2="1150" y2="750"/><line x1="50" y1="50" x2="50" y2="750"/><line x1="1150" y1="50" x2="1150" y2="750"/></g></svg>')`,
        }}
      ></div>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      {/* Floating Data Points */}
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 text-lg">Sign in to your account</p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 border border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-12 h-12 border border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors duration-200"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Sign up link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
