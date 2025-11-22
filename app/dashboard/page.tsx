"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { runAgentLoop, getMemories, type AgentMessage, type AgentRole } from "@/app/actions/agent";
import { createClient } from "@/lib/supabase/client";
import { Search, Copy, Check, Rocket, Code, TestTube, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const roleConfig: Record<AgentRole, { label: string; icon: React.ReactNode; color: string }> = {
  supervisor: {
    label: "Supervisor",
    icon: <Brain className="h-4 w-4" />,
    color: "bg-stellar-glow/20 text-stellar-glow border-stellar-glow/30",
  },
  researcher: {
    label: "Researcher",
    icon: <Rocket className="h-4 w-4" />,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  coder: {
    label: "Coder",
    icon: <Code className="h-4 w-4" />,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  tester: {
    label: "Tester",
    icon: <TestTube className="h-4 w-4" />,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

interface MemoryEntry {
  id: string;
  agentRole: AgentRole;
  content: string;
  createdAt: Date;
  metadata?: string;
}

export default function DashboardPage() {
  const [goal, setGoal] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("dev-user-id");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user ID
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (userId) {
      loadMemories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMemories = async () => {
    if (!userId) return;
    try {
      const results = await getMemories(userId, 20);
      setMemories(
        results.map((m) => ({
          id: m.id,
          agentRole: m.agentRole as AgentRole,
          content: m.content,
          createdAt: new Date(m.createdAt),
          metadata: m.metadata || undefined,
        }))
      );
    } catch (error) {
      console.error("Failed to load memories:", error);
    }
  };

  const handleRunAgent = async () => {
    if (!goal.trim() || isRunning) return;

    setIsRunning(true);
    setMessages([]);

    try {
      const state = await runAgentLoop(goal);
      setMessages(state.messages);
      await loadMemories();
    } catch (error) {
      console.error("Agent loop error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMemories = memories.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.agentRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const messagesByRole = {
    supervisor: messages.filter((m) => m.role === "supervisor"),
    researcher: messages.filter((m) => m.role === "researcher"),
    coder: messages.filter((m) => m.role === "coder"),
    tester: messages.filter((m) => m.role === "tester"),
  };

  return (
    <div className="min-h-screen stellar-bg p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 neon-glow">
              Multi-Agent Supervisor
            </h1>
            <p className="text-muted-foreground">
              Orchestrate AI agents to achieve your goals
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-stellar-glow hidden sm:block" />
        </div>

        {/* Input Bar */}
        <Card className="bg-stellar-navy/50 border-stellar-blue/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Textarea
                placeholder="Enter your goal... (e.g., 'Build a todo app with React')"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[100px] bg-stellar-navy/30 border-stellar-blue/20 text-foreground resize-none"
                disabled={isRunning}
              />
              <Button
                onClick={handleRunAgent}
                disabled={isRunning || !goal.trim()}
                variant="stellar"
                className="sm:w-auto w-full h-auto py-3 px-6"
              >
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      <Rocket className="h-4 w-4" />
                    </motion.div>
                    Running...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Run Agent
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Agent Trace & Tool Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Thinking Trace */}
            <Card className="bg-stellar-navy/50 border-stellar-blue/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-stellar-glow" />
                  Live Thinking Trace
                </CardTitle>
                <CardDescription>
                  Real-time agent messages and tool executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={traceRef}
                  className="max-h-[600px] overflow-y-auto space-y-4 pr-2 custom-scrollbar"
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start by entering a goal above.</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {messages.map((message, idx) => {
                        const config = roleConfig[message.role];
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="space-y-2">
                              {/* Message Card */}
                              <div className="bg-stellar-navy/30 border border-stellar-blue/20 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <Badge
                                    className={cn(
                                      "flex items-center gap-1.5",
                                      config.color
                                    )}
                                  >
                                    {config.icon}
                                    {config.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>

                              {/* Tool Execution Card */}
                              {message.toolExecution && (
                                <motion.div
                                  initial={{ scale: 0.95, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="ml-4"
                                >
                                  <Card className="bg-stellar-blue/20 border-stellar-glow/30">
                                    <CardContent className="pt-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <Badge
                                          variant="outline"
                                          className="text-stellar-glow border-stellar-glow/50"
                                        >
                                          {message.toolExecution.tool}
                                        </Badge>
                                        <Badge
                                          className={
                                            message.toolExecution.status === "success"
                                              ? "bg-green-500/20 text-green-400"
                                              : message.toolExecution.status === "error"
                                              ? "bg-red-500/20 text-red-400"
                                              : "bg-yellow-500/20 text-yellow-400"
                                          }
                                        >
                                          {message.toolExecution.status}
                                        </Badge>
                                      </div>
                                      <div className="space-y-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Input:</span>
                                          <p className="mt-1 font-mono bg-stellar-navy/50 p-2 rounded">
                                            {message.toolExecution.input}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Output:</span>
                                          <p className="mt-1 font-mono bg-stellar-navy/50 p-2 rounded">
                                            {message.toolExecution.output}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Agent Tabs */}
            {messages.length > 0 && (
              <Card className="bg-stellar-navy/50 border-stellar-blue/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Agent Streams</CardTitle>
                  <CardDescription>
                    View messages by individual agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="supervisor" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-stellar-navy/30">
                      <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
                      <TabsTrigger value="researcher">Researcher</TabsTrigger>
                      <TabsTrigger value="coder">Coder</TabsTrigger>
                      <TabsTrigger value="tester">Tester</TabsTrigger>
                    </TabsList>
                    <TabsContent value="supervisor" className="mt-4">
                      <AgentStream messages={messagesByRole.supervisor} />
                    </TabsContent>
                    <TabsContent value="researcher" className="mt-4">
                      <AgentStream messages={messagesByRole.researcher} />
                    </TabsContent>
                    <TabsContent value="coder" className="mt-4">
                      <AgentStream messages={messagesByRole.coder} />
                    </TabsContent>
                    <TabsContent value="tester" className="mt-4">
                      <AgentStream messages={messagesByRole.tester} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Memory Timeline */}
          <div className="lg:col-span-1">
            <Card className="bg-stellar-navy/50 border-stellar-blue/30 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle>Memory Timeline</CardTitle>
                <CardDescription>
                  Last 20 agent memories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-stellar-navy/30 border-stellar-blue/20"
                  />
                </div>

                {/* Memory Table */}
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-stellar-blue/20">
                        <TableHead className="text-xs">Agent</TableHead>
                        <TableHead className="text-xs">Content</TableHead>
                        <TableHead className="text-xs w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredMemories.map((memory, idx) => {
                          const config = roleConfig[memory.agentRole];
                          return (
                            <motion.tr
                              key={memory.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: idx * 0.05 }}
                              className="border-stellar-blue/10"
                            >
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "text-xs flex items-center gap-1",
                                    config.color
                                  )}
                                >
                                  {config.icon}
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {memory.content}
                                </p>
                                <p className="text-xs text-muted-foreground/50 mt-1">
                                  {memory.createdAt.toLocaleDateString()}
                                </p>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopy(memory.content, memory.id)}
                                >
                                  {copiedId === memory.id ? (
                                    <Check className="h-3 w-3 text-green-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                  {filteredMemories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No memories found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 58, 95, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 53, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 107, 53, 0.7);
        }
      `}</style>
    </div>
  );
}

function AgentStream({ messages }: { messages: AgentMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No messages from this agent yet
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
      <AnimatePresence>
        {messages.map((message, idx) => {
          const config = roleConfig[message.role];
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-stellar-navy/30 border border-stellar-blue/20 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={cn("text-xs", config.color)}>
                  {config.icon}
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {message.content}
              </p>
              {message.toolExecution && (
                <div className="mt-2 pt-2 border-t border-stellar-blue/20">
                  <Badge variant="outline" className="text-xs mr-2">
                    {message.toolExecution.tool}
                  </Badge>
                  <Badge
                    className={
                      message.toolExecution.status === "success"
                        ? "bg-green-500/20 text-green-400 text-xs"
                        : "bg-yellow-500/20 text-yellow-400 text-xs"
                    }
                  >
                    {message.toolExecution.status}
                  </Badge>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
