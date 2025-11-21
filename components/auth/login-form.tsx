"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Rocket } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Temporary dev bypass – re-enable on Day 2
      if (process.env.NODE_ENV === "production") {
        router.push("/dashboard");
        router.refresh();
      } else {
        // In development, just show success message
        setLoading(false);
        setError(null);
        alert("Login successful (dev mode - redirect disabled)");
      }
    }
  };

  return (
    <Card className="bg-stellar-navy/80 backdrop-blur-md border-stellar-glow/30 shadow-stellar-glow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Rocket className="h-12 w-12 text-stellar-glow animate-float" />
            <Sparkles className="h-6 w-6 text-stellar-orange absolute -top-1 -right-1 animate-pulse-glow" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold neon-glow text-stellar-glow">
          Stellar Foundry
        </CardTitle>
        <CardDescription className="text-stellar-light/80">
          Enter your credentials to access the galactic interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stellar-light">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="commander@stellarfoundry.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-stellar-deep/50 border-stellar-blue/50 text-white placeholder:text-stellar-light/50 focus:border-stellar-glow focus:ring-stellar-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-stellar-light">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-stellar-deep/50 border-stellar-blue/50 text-white placeholder:text-stellar-light/50 focus:border-stellar-glow focus:ring-stellar-glow"
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-3">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="stellar"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Accessing..." : "Launch"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-stellar-light/70 text-center">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-stellar-glow hover:text-stellar-orange transition-colors font-semibold"
          >
            Create one
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

