import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Real API login
async function apiLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const resp = await api.post('/api/auth/login', { email, password });
  // server returns { success, message, data }
  const payload = resp.data?.data || resp.data;
  return { token: payload.accessToken || payload.access_token || payload.access, user: payload.user };
}

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  async function onSubmit(data: LoginFormData) {
    try {
      const { token, user } = await apiLogin(data.email, data.password);
      login(token, user);
    } catch {
      form.setError("password", { message: "Invalid email or password." });
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to your AssetFlow account.
        </p>
      </div>

      {/* Demo Credentials */}
      <div className="mb-6 p-3.5 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-xs font-semibold text-primary mb-2">Demo Credentials</p>
        <div className="space-y-1 text-xs text-muted-foreground font-mono">
          <div>admin@assetflow.com / any_password</div>
          <div>manager@assetflow.com / any_password</div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
