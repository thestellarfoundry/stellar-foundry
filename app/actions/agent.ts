"use server";

import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { memories } from "@/db/schema";
import { callClaude } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

export type AgentRole = "supervisor" | "researcher" | "coder" | "tester";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: Date;
  toolExecution?: {
    tool: string;
    input: string;
    output: string;
    status: "success" | "error" | "pending";
  };
}

export interface AgentState {
  goal: string;
  messages: AgentMessage[];
  currentPhase: "planning" | "acting" | "observing" | "critiquing" | "complete";
  iteration: number;
  maxIterations: number;
}

async function saveMemory(
  userId: string,
  agentRole: AgentRole,
  content: string,
  metadata?: Record<string, any>
) {
  await db.insert(memories).values({
    userId,
    agentRole,
    content,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    // Dev mode fallback
    return "dev-user-id";
  }
  return user.id;
}

export async function runAgentLoop(goal: string): Promise<AgentState> {
  const userId = await getUserId();
  const state: AgentState = {
    goal,
    messages: [],
    currentPhase: "planning",
    iteration: 0,
    maxIterations: 10,
  };

  // Supervisor system prompt
  const supervisorPrompt = `You are a Supervisor AI orchestrating a team of 3 specialized agents:
- Researcher: Conducts research and gathers information
- Coder: Writes and executes code
- Tester: Tests and validates code

Your goal: ${goal}

Follow this loop:
1. PLAN: Analyze the goal and decide which agent should act next
2. ACT: Delegate to the appropriate agent
3. OBSERVE: Review the agent's output
4. CRITIQUE: Evaluate progress and decide next steps
5. Repeat until the goal is complete

Be concise and action-oriented.`;

  while (state.iteration < state.maxIterations && state.currentPhase !== "complete") {
    state.iteration++;

    // Supervisor plans
    if (state.currentPhase === "planning") {
      const planPrompt = state.messages.length === 0
        ? `Goal: ${goal}\n\nCreate an initial plan.`
        : `Goal: ${goal}\n\nPrevious messages:\n${state.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n")}\n\nWhat should we do next?`;

      const plan = await callClaude(
        [{ role: "user", content: planPrompt }],
        supervisorPrompt
      );

      const message: AgentMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: "supervisor",
        content: plan,
        timestamp: new Date(),
      };
      state.messages.push(message);
      await saveMemory(userId, "supervisor", plan);

      // Decide which agent to use
      const agentDecision = await callClaude(
        [
          { role: "user", content: `Based on this plan: "${plan}", which agent should act next? Respond with only: researcher, coder, or tester` }
        ],
        supervisorPrompt
      );

      const selectedAgent = agentDecision.toLowerCase().includes("researcher") ? "researcher"
        : agentDecision.toLowerCase().includes("tester") ? "tester"
        : "coder";

      state.currentPhase = "acting";
      
      // Agent acts
      const agentPrompts: Record<AgentRole, string> = {
        supervisor: "",
        researcher: `You are a Researcher agent. Your task: ${goal}\n\nConduct research, gather information, and provide insights.`,
        coder: `You are a Coder agent. Your task: ${goal}\n\nWrite code, implement solutions, and execute programs.`,
        tester: `You are a Tester agent. Your task: ${goal}\n\nTest code, validate functionality, and report issues.`,
      };

      const agentAction = await callClaude(
        [
          { role: "user", content: `Plan: ${plan}\n\nTake action now.` }
        ],
        agentPrompts[selectedAgent]
      );

      // Simulate tool execution
      const tools = ["web_search", "browse_page", "code_execution"];
      const randomTool = tools[Math.floor(Math.random() * tools.length)];

      const agentMessage: AgentMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: selectedAgent,
        content: agentAction,
        timestamp: new Date(),
        toolExecution: {
          tool: randomTool,
          input: `Execute ${randomTool} for: ${goal}`,
          output: `Tool ${randomTool} completed successfully`,
          status: "success",
        },
      };
      state.messages.push(agentMessage);
      await saveMemory(userId, selectedAgent, agentAction, {
        tool: randomTool,
        input: agentMessage.toolExecution?.input,
        output: agentMessage.toolExecution?.output,
      });

      state.currentPhase = "observing";
    }

    // Supervisor observes
    if (state.currentPhase === "observing") {
      const observation = await callClaude(
        [
          { role: "user", content: `Review the latest agent output. What did we learn?` }
        ],
        supervisorPrompt
      );

      const message: AgentMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: "supervisor",
        content: observation,
        timestamp: new Date(),
      };
      state.messages.push(message);
      await saveMemory(userId, "supervisor", observation);

      state.currentPhase = "critiquing";
    }

    // Supervisor critiques
    if (state.currentPhase === "critiquing") {
      const critique = await callClaude(
        [
          { role: "user", content: `Goal: ${goal}\n\nEvaluate progress. Should we continue or are we done?` }
        ],
        supervisorPrompt
      );

      const message: AgentMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: "supervisor",
        content: critique,
        timestamp: new Date(),
      };
      state.messages.push(message);
      await saveMemory(userId, "supervisor", critique);

      // Check if complete
      if (critique.toLowerCase().includes("complete") || 
          critique.toLowerCase().includes("done") ||
          critique.toLowerCase().includes("finished")) {
        state.currentPhase = "complete";
      } else {
        state.currentPhase = "planning";
      }
    }
  }

  if (state.iteration >= state.maxIterations) {
    state.currentPhase = "complete";
  }

  revalidatePath("/dashboard");
  return state;
}

export async function getMemories(userId: string, limit: number = 20) {
  try {
    const results = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt))
      .limit(limit);

    return results;
  } catch (error) {
    console.error("Error fetching memories:", error);
    return [];
  }
}

