"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/admin/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err?.message ?? "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09221F] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#218F87] text-lg font-bold text-white">
            T
          </span>
          <h1 className="mt-4 text-xl font-bold text-white">TNH Salon Admin</h1>
          <p className="mt-1 text-sm text-white/60">
            Sign in to manage services, categories and branches.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#D7EAE7] bg-[#FFFDF9] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#173B38]">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DB4B0]"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter admin email"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-[#D7EAE7] bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[#9DB4B0] focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#173B38]">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DB4B0]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-[#D7EAE7] bg-white pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-[#9DB4B0] focus:border-[#218F87] focus:ring-2 focus:ring-[#218F87]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9DB4B0] transition-colors hover:text-[#218F87]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#218F87] text-sm font-semibold text-white transition-colors hover:bg-[#1B756E] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading ? <ArrowRight size={15} /> : null}
            </button>
          </div>

          <p className="mt-5 border-t border-[#E3EFED] pt-4 text-center text-[11px] leading-5 text-[#5F7774]">
            Protected admin area — access is restricted to authorized TNH staff.
          </p>
        </form>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-white/60 transition-colors hover:text-white"
          >
            ← Back to customer website
          </Link>
        </p>
      </div>
    </div>
  );
}
