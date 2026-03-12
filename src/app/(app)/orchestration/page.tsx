"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Network,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CircleDot,
  Users,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useOrchestrationStore,
  type OrchestratedAgent,
  type AgentRole,
  type AgentStatus,
  type Orchestration,
  type OrchLog,
} from "@/stores/orchestration-store";
import { ProGate } from "@/components/shared/pro-gate";

// --- Node Graph Component ---

const ROLE_COLORS: Record<AgentRole, { fill: string; stroke: string; text: string }> = {
  coordinator: { fill: "#3b82f6", stroke: "#2563eb", text: "#eff6ff" },
  worker: { fill: "#22c55e", stroke: "#16a34a", text: "#f0fdf4" },
  reviewer: { fill: "#f59e0b", stroke: "#d97706", text: "#fffbeb" },
};

const STATUS_RING: Record<AgentStatus, string> = {
  idle: "#9ca3af",
  running: "#3b82f6",
  completed: "#22c55e",
  error: "#ef4444",
};

function computeNodePositions(agents: OrchestratedAgent[]) {
  const cx = 250;
  const cy = 160;
  const radius = 110;

  const coordinators = agents.filter((a) => a.role === "coordinator");
  const others = agents.filter((a) => a.role !== "coordinator");

  const positions: Record<string, { x: number; y: number }> = {};

  // Place coordinators at center (stacked vertically if multiple)
  coordinators.forEach((c, i) => {
    positions[c.id] = { x: cx, y: cy + i * 60 - (coordinators.length - 1) * 30 };
  });

  // Place others in a circle around center
  others.forEach((a, i) => {
    const angle = (2 * Math.PI * i) / Math.max(others.length, 1) - Math.PI / 2;
    positions[a.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return positions;
}

function NodeGraph({ orchestration }: { orchestration: Orchestration }) {
  const { agents, links } = orchestration;
  const positions = computeNodePositions(agents);

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <Network className="size-5 mr-2 opacity-50" />
        エージェントを追加してグラフを表示
      </div>
    );
  }

  return (
    <svg viewBox="0 0 500 320" className="w-full h-full">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
      </defs>

      {/* Links */}
      {links.map((link) => {
        const from = positions[link.from];
        const to = positions[link.to];
        if (!from || !to) return null;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nodeRadius = 28;
        const offsetX = (dx / dist) * nodeRadius;
        const offsetY = (dy / dist) * nodeRadius;

        const isActive =
          agents.find((a) => a.id === link.from)?.status === "running" ||
          agents.find((a) => a.id === link.to)?.status === "running";

        return (
          <g key={link.id}>
            <line
              x1={from.x + offsetX}
              y1={from.y + offsetY}
              x2={to.x - offsetX}
              y2={to.y - offsetY}
              stroke={isActive ? "#3b82f6" : "#6b7280"}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={link.protocol === "direct" ? "6 3" : undefined}
              markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
              opacity={isActive ? 1 : 0.5}
            />
            {link.label && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#9ca3af"
              >
                {link.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {agents.map((agent) => {
        const pos = positions[agent.id];
        if (!pos) return null;
        const colors = ROLE_COLORS[agent.role];
        const ringColor = STATUS_RING[agent.status];

        return (
          <g key={agent.id}>
            {/* Status ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={30}
              fill="none"
              stroke={ringColor}
              strokeWidth={agent.status === "running" ? 3 : 2}
              opacity={agent.status === "idle" ? 0.4 : 1}
            >
              {agent.status === "running" && (
                <animate
                  attributeName="r"
                  values="30;33;30"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            {agent.status === "running" && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={30}
                fill="none"
                stroke={ringColor}
                strokeWidth={1}
                opacity={0.3}
              >
                <animate
                  attributeName="r"
                  values="30;40"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            {/* Node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={26}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={2}
            />
            {/* Role icon text */}
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fill={colors.text}
            >
              {agent.role === "coordinator" ? "C" : agent.role === "worker" ? "W" : "R"}
            </text>
            {/* Agent name label */}
            <text
              x={pos.x}
              y={pos.y + 44}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              className="fill-foreground"
            >
              {agent.name.length > 12 ? agent.name.slice(0, 11) + "..." : agent.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// --- Log Entry Component ---

const LOG_TYPE_STYLES: Record<string, { color: string; icon: typeof Activity }> = {
  info: { color: "text-blue-500", icon: Activity },
  success: { color: "text-green-500", icon: CheckCircle2 },
  error: { color: "text-red-500", icon: AlertCircle },
  warning: { color: "text-amber-500", icon: AlertCircle },
};

function LogEntry({ log }: { log: OrchLog }) {
  const style = LOG_TYPE_STYLES[log.type] || LOG_TYPE_STYLES.info;
  const Icon = style.icon;
  const time = new Date(log.timestamp).toLocaleTimeString("ja-JP");

  return (
    <div className="flex items-start gap-2 py-1.5 px-2 text-sm hover:bg-muted/50 rounded">
      <Icon className={`size-4 mt-0.5 shrink-0 ${style.color}`} />
      <span className="text-muted-foreground shrink-0 tabular-nums text-xs mt-0.5">
        {time}
      </span>
      <span className="font-medium shrink-0 text-xs mt-0.5">[{log.agentName}]</span>
      <span className="text-foreground/80 text-xs mt-0.5">{log.message}</span>
    </div>
  );
}

// --- Status Badge ---

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "待機中",
  running: "実行中",
  completed: "完了",
  error: "エラー",
};

function StatusBadge({ status }: { status: AgentStatus }) {
  const variant =
    status === "completed"
      ? "default"
      : status === "error"
        ? "destructive"
        : "secondary";

  return (
    <Badge variant={variant} className="text-[10px] px-1.5 py-0">
      {status === "running" && (
        <span className="inline-block size-1.5 rounded-full bg-blue-400 animate-pulse mr-1" />
      )}
      {STATUS_LABELS[status]}
    </Badge>
  );
}

// --- Role Badge ---

const ROLE_LABELS: Record<AgentRole, string> = {
  coordinator: "コーディネーター",
  worker: "ワーカー",
  reviewer: "レビュアー",
};

function RoleBadge({ role }: { role: AgentRole }) {
  const colorClass =
    role === "coordinator"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : role === "worker"
        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

// --- Main Page ---

export default function OrchestrationPage() {
  const {
    orchestrations,
    activeOrchId,
    addOrchestration,
    removeOrchestration,
    addAgent,
    removeAgent,
    updateAgentStatus,
    addLink,
    addLog,
    clearLogs,
    setActiveOrch,
    setOrchestrationStatus,
  } = useOrchestrationStore();

  const [mounted, setMounted] = useState(false);
  const [newOrchName, setNewOrchName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentUrl, setAgentUrl] = useState("");
  const [agentRole, setAgentRole] = useState<AgentRole>("worker");
  const [linkFrom, setLinkFrom] = useState("");
  const [linkTo, setLinkTo] = useState("");
  const [linkProtocol, setLinkProtocol] = useState<"a2a" | "direct">("a2a");
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const activeOrch = orchestrations.find((o) => o.id === activeOrchId) || null;

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeOrch?.logs.length]);

  const handleCreateOrch = () => {
    if (!newOrchName.trim()) return;
    addOrchestration(newOrchName.trim());
    setNewOrchName("");
  };

  const handleAddAgent = () => {
    if (!activeOrchId || !agentName.trim() || !agentUrl.trim()) return;
    addAgent(activeOrchId, agentName.trim(), agentUrl.trim(), agentRole);
    setAgentName("");
    setAgentUrl("");
  };

  const handleAddLink = () => {
    if (!activeOrchId || !linkFrom || !linkTo || linkFrom === linkTo) return;
    addLink(activeOrchId, linkFrom, linkTo, linkProtocol);
    setLinkFrom("");
    setLinkTo("");
  };

  // Demo simulation
  const runSimulation = useCallback(async () => {
    if (!activeOrch || activeOrch.agents.length === 0) return;
    setIsSimulating(true);
    simulationRef.current = true;

    const orchId = activeOrch.id;
    setOrchestrationStatus(orchId, "running");

    // Reset all agents to idle
    for (const agent of activeOrch.agents) {
      updateAgentStatus(orchId, agent.id, "idle");
    }

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const coordinators = activeOrch.agents.filter((a) => a.role === "coordinator");
    const workers = activeOrch.agents.filter((a) => a.role === "worker");
    const reviewers = activeOrch.agents.filter((a) => a.role === "reviewer");

    // Phase 1: Coordinators start
    addLog(orchId, "system", "システム", "オーケストレーション開始", "info");

    for (const coord of coordinators) {
      if (!simulationRef.current) break;
      updateAgentStatus(orchId, coord.id, "running", "タスク分配中...");
      addLog(orchId, coord.id, coord.name, "タスクの分析と分配を開始", "info");
      await delay(1200);
      if (!simulationRef.current) break;
      updateAgentStatus(orchId, coord.id, "completed", "タスク分配完了");
      addLog(orchId, coord.id, coord.name, "タスク分配完了", "success");
    }

    // Phase 2: Workers execute in parallel
    if (simulationRef.current && workers.length > 0) {
      addLog(orchId, "system", "システム", `${workers.length}件のワーカーを並列実行`, "info");

      for (const worker of workers) {
        updateAgentStatus(orchId, worker.id, "running", "タスク実行中...");
        addLog(orchId, worker.id, worker.name, "タスク実行開始", "info");
      }

      await delay(2000);

      for (const worker of workers) {
        if (!simulationRef.current) break;
        updateAgentStatus(orchId, worker.id, "completed", "タスク完了");
        addLog(orchId, worker.id, worker.name, "タスク実行完了", "success");
        await delay(400);
      }
    }

    // Phase 3: Reviewers check results
    if (simulationRef.current && reviewers.length > 0) {
      addLog(orchId, "system", "システム", "レビューフェーズ開始", "info");

      for (const reviewer of reviewers) {
        if (!simulationRef.current) break;
        updateAgentStatus(orchId, reviewer.id, "running", "レビュー中...");
        addLog(orchId, reviewer.id, reviewer.name, "結果のレビューを開始", "info");
        await delay(1500);
        if (!simulationRef.current) break;
        updateAgentStatus(orchId, reviewer.id, "completed", "レビュー完了");
        addLog(orchId, reviewer.id, reviewer.name, "レビュー完了: 全てのタスクが正常に完了", "success");
      }
    }

    if (simulationRef.current) {
      setOrchestrationStatus(orchId, "completed");
      addLog(orchId, "system", "システム", "オーケストレーション完了", "success");
    }

    setIsSimulating(false);
    simulationRef.current = false;
  }, [activeOrch, addLog, updateAgentStatus, setOrchestrationStatus]);

  if (!mounted) return null;

  return (
    <ProGate feature="orchestration" fallbackTitle="オーケストレーション" fallbackDescription="オーケストレーションはProプランでご利用いただけます。複数AIを連携させたワークフローを構築できます。">
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <Network className="size-5 text-primary" />
        <h1 className="font-semibold text-lg">マルチエージェント</h1>
        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Orchestration selector */}
        {orchestrations.length > 0 && (
          <Select
            value={activeOrchId || ""}
            onValueChange={(val) => setActiveOrch(val)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="オーケストレーションを選択" />
            </SelectTrigger>
            <SelectContent>
              {orchestrations.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* New orchestration */}
        <div className="flex items-center gap-2 ml-auto">
          <Input
            value={newOrchName}
            onChange={(e) => setNewOrchName(e.target.value)}
            placeholder="新規オーケストレーション名"
            className="w-48 h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleCreateOrch()}
          />
          <Button size="sm" variant="outline" onClick={handleCreateOrch} disabled={!newOrchName.trim()}>
            <Plus className="size-4 mr-1" />
            作成
          </Button>
          {activeOrch && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => removeOrchestration(activeOrch.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </header>

      {!activeOrch ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <Network className="size-12 mx-auto opacity-30" />
            <p className="text-sm">オーケストレーションを作成または選択してください</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Node Graph */}
          <div className="border-b bg-muted/20 p-4 shrink-0" style={{ height: "360px" }}>
            <NodeGraph orchestration={activeOrch} />
          </div>

          {/* Bottom: Two columns */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Agent list */}
            <div className="w-1/2 border-r flex flex-col overflow-hidden">
              <div className="px-4 pt-3 pb-2 shrink-0">
                <h2 className="font-medium text-sm flex items-center gap-2">
                  <Users className="size-4" />
                  エージェント ({activeOrch.agents.length})
                </h2>
              </div>

              {/* Add Agent Form */}
              <div className="px-4 pb-3 space-y-2 shrink-0 border-b">
                <div className="flex gap-2">
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="エージェント名"
                    className="h-8 text-sm flex-1"
                  />
                  <Select
                    value={agentRole}
                    onValueChange={(val) => setAgentRole(val as AgentRole)}
                  >
                    <SelectTrigger className="w-36 h-8" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coordinator">コーディネーター</SelectItem>
                      <SelectItem value="worker">ワーカー</SelectItem>
                      <SelectItem value="reviewer">レビュアー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={agentUrl}
                    onChange={(e) => setAgentUrl(e.target.value)}
                    placeholder="エンドポイント URL"
                    className="h-8 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddAgent}
                    disabled={!agentName.trim() || !agentUrl.trim()}
                  >
                    <Plus className="size-4 mr-1" />
                    追加
                  </Button>
                </div>

                {/* Add Link Form */}
                {activeOrch.agents.length >= 2 && (
                  <div className="flex gap-2 items-center pt-1">
                    <Link2 className="size-4 text-muted-foreground shrink-0" />
                    <Select value={linkFrom} onValueChange={setLinkFrom}>
                      <SelectTrigger className="h-7 text-xs flex-1" size="sm">
                        <SelectValue placeholder="送信元" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeOrch.agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground text-xs">→</span>
                    <Select value={linkTo} onValueChange={setLinkTo}>
                      <SelectTrigger className="h-7 text-xs flex-1" size="sm">
                        <SelectValue placeholder="送信先" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeOrch.agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={linkProtocol} onValueChange={(v) => setLinkProtocol(v as "a2a" | "direct")}>
                      <SelectTrigger className="h-7 text-xs w-20" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a2a">A2A</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={handleAddLink}
                      disabled={!linkFrom || !linkTo || linkFrom === linkTo}
                    >
                      接続
                    </Button>
                  </div>
                )}
              </div>

              {/* Agent Cards */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {activeOrch.agents.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      エージェントが未登録です
                    </p>
                  ) : (
                    activeOrch.agents.map((agent) => (
                      <Card key={agent.id} className="py-2 gap-0">
                        <CardContent className="px-3 py-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CircleDot
                                className="size-4"
                                style={{ color: ROLE_COLORS[agent.role].fill }}
                              />
                              <span className="font-medium text-sm">{agent.name}</span>
                              <RoleBadge role={agent.role} />
                              <StatusBadge status={agent.status} />
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="size-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeAgent(activeOrch.id, agent.id)}
                              disabled={isSimulating}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground truncate">
                            {agent.endpointUrl}
                          </div>
                          {agent.lastMessage && (
                            <div className="mt-1 text-xs text-foreground/70 truncate">
                              {agent.lastMessage}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right: Log panel */}
            <div className="w-1/2 flex flex-col overflow-hidden">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0">
                <h2 className="font-medium text-sm flex items-center gap-2">
                  <Activity className="size-4" />
                  ログ ({activeOrch.logs.length})
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => clearLogs(activeOrch.id)}
                  disabled={activeOrch.logs.length === 0}
                >
                  クリア
                </Button>
              </div>
              <Separator />
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {activeOrch.logs.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      ログがありません
                    </p>
                  ) : (
                    activeOrch.logs.map((log) => (
                      <LogEntry key={log.id} log={log} />
                    ))
                  )}
                  <div ref={logEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t bg-card px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>ステータス:</span>
              <Badge
                variant={
                  activeOrch.status === "completed"
                    ? "default"
                    : activeOrch.status === "running"
                      ? "secondary"
                      : "outline"
                }
              >
                {activeOrch.status === "idle"
                  ? "待機中"
                  : activeOrch.status === "running"
                    ? "実行中"
                    : "完了"}
              </Badge>
            </div>
            <Button
              onClick={runSimulation}
              disabled={isSimulating || activeOrch.agents.length === 0}
            >
              <Play className="size-4 mr-2" />
              {isSimulating ? "シミュレーション中..." : "オーケストレーション開始"}
            </Button>
          </footer>
        </div>
      )}
      </div>
    </ProGate>
  );
}
