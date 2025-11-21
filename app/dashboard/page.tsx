import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Sparkles, Zap } from "lucide-react";

export default async function DashboardPage() {
  // Temporary dev bypass – re-enable on Day 2
  let user = null;
  if (process.env.NODE_ENV === "production") {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } else {
    // Mock user for development
    user = {
      id: "dev-user-id",
      email: "dev@stellarfoundry.com",
    } as any;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Commander</h2>
          <p className="text-muted-foreground">
            Your AI agent interface is ready for deployment
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-stellar-navy/50 border-stellar-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
              <Rocket className="h-4 w-4 text-stellar-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Active agents ready
              </p>
            </CardContent>
          </Card>

          <Card className="bg-stellar-navy/50 border-stellar-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <Sparkles className="h-4 w-4 text-stellar-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total conversations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-stellar-navy/50 border-stellar-blue/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Zap className="h-4 w-4 text-stellar-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Online</div>
              <p className="text-xs text-muted-foreground">
                System operational
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-stellar-navy/30 border-stellar-blue/20">
          <CardHeader>
            <CardTitle>AI Agent Interface</CardTitle>
            <CardDescription>
              Your dashboard is ready. Start building your AI agent interface
              here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This is your protected dashboard. You can now build out your AI
                agent interface components here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

