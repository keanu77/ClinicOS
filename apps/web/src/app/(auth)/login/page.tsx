"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email 或密碼錯誤");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("登入時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-teal-300/30" />
      <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-blue-300/40" />
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-cyan-300/30" />

      <Card className="w-full max-w-md shadow-xl border-0 relative z-10">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-200">
              <Activity className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-teal-900">
            Clinic OS
          </CardTitle>
          <CardDescription className="text-sm">
            聯新運動醫學科 · 營運管理系統
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 btn-lift font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" className="text-white" />
                  登入中...
                </span>
              ) : (
                "登入"
              )}
            </Button>
          </form>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>測試帳號：</p>
              <p className="text-xs mt-1">
                admin@clinic.local / password123 (管理員)
              </p>
              <p className="text-xs">
                supervisor@clinic.local / password123 (主管)
              </p>
              <p className="text-xs">
                staff1@clinic.local / password123 (員工)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
