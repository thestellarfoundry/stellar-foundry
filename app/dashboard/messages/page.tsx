import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Messages</h2>
          <p className="text-muted-foreground">
            Your conversation history with AI agents
          </p>
        </div>

        <Card className="bg-stellar-navy/30 border-stellar-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-stellar-glow" />
              Messages
            </CardTitle>
            <CardDescription>
              Your messages will appear here once you start conversations with
              AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              No messages yet. Start a conversation to begin.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

