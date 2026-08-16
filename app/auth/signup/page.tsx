"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasRealSupabase =
        supabaseUrl &&
        !supabaseUrl.includes("placeholder") &&
        supabaseUrl.startsWith("https://");

      if (hasRealSupabase) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      } else {
        // Demo mode — save to localStorage
        const existing: Array<{ email: string; password: string; name: string }> =
          JSON.parse(localStorage.getItem("documind_users") ?? "[]");

        if (existing.find((u) => u.email === email)) {
          setError("An account with this email already exists. Try signing in.");
          setLoading(false);
          return;
        }

        existing.push({ email, password, name });
        localStorage.setItem("documind_users", JSON.stringify(existing));
        localStorage.setItem("documind_session", JSON.stringify({ email, name }));
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle size={52} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Account created!</h2>
        <p className="text-gray-400">Taking you to your workspace...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
        <p className="text-gray-400">Start thinking faster with your documents</p>
      </div>

      <div className="bg-[#111320] border border-white/8 rounded-2xl p-8">
        <form onSubmit={handleSignUp} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              required
              autoComplete="name"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating account..." : "Create free account"}
          </button>

          <p className="text-xs text-center text-gray-500">
            By signing up you agree to our{" "}
            <Link href="#" className="text-purple-400 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-purple-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
