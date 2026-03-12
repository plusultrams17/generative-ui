"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Download,
  Play,
  Zap,
  Bot,
  GitBranch,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Copy,
} from "lucide-react";
import Link from "next/link";
import {
  useAgentBuilderStore,
  NODE_TEMPLATES,
  type FlowNode,
  type FlowNodeType,
} from "@/stores/agent-builder-store";
import { ProGate } from "@/components/shared/pro-gate";

const NODE_TYPE_CONFIG: Record<
  FlowNodeType,
  { label: string; icon: typeof Zap; color: string; bg: string; border: string }
> = {
  trigger: {
    label: "トリガー",
    icon: Zap,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  action: {
    label: "アクション",
    icon: Bot,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
  },
  condition: {
    label: "条件",
    icon: GitBranch,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
  },
  output: {
    label: "出力",
    icon: MessageSquare,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
  },
};

const SVG_NODE_COLORS: Record<FlowNodeType, { fill: string; stroke: string; text: string }> = {
  trigger: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1d4ed8" },
  action: { fill: "#dcfce7", stroke: "#22c55e", text: "#15803d" },
  condition: { fill: "#fef3c7", stroke: "#f59e0b", text: "#b45309" },
  output: { fill: "#f3e8ff", stroke: "#a855f7", text: "#7e22ce" },
};

function NodeCard({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
}: {
  node: FlowNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}) {
  const config = NODE_TYPE_CONFIG[node.type];
  const Icon = config.icon;

  return (
    <g
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        onDragStart(e);
      }}
      className="cursor-grab active:cursor-grabbing"
      role="button"
      tabIndex={0}
    >
      <rect
        x={node.position.x}
        y={node.position.y}
        width={180}
        height={60}
        rx={8}
        fill={SVG_NODE_COLORS[node.type].fill}
        stroke={isSelected ? "#2563eb" : SVG_NODE_COLORS[node.type].stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <foreignObject
        x={node.position.x}
        y={node.position.y}
        width={180}
        height={60}
      >
        <div className="flex h-full items-center gap-2 px-3">
          <Icon
            className="size-4 shrink-0"
            style={{ color: SVG_NODE_COLORS[node.type].text }}
          />
          <span
            className="truncate text-xs font-medium"
            style={{ color: SVG_NODE_COLORS[node.type].text }}
          >
            {node.label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-auto shrink-0 rounded p-0.5 opacity-50 hover:opacity-100"
          >
            <Trash2 className="size-3" style={{ color: SVG_NODE_COLORS[node.type].text }} />
          </button>
        </div>
      </foreignObject>
    </g>
  );
}

function EdgePath({
  sourceNode,
  targetNode,
  onDelete,
}: {
  sourceNode: FlowNode;
  targetNode: FlowNode;
  onDelete: () => void;
}) {
  const sx = sourceNode.position.x + 180;
  const sy = sourceNode.position.y + 30;
  const tx = targetNode.position.x;
  const ty = targetNode.position.y + 30;
  const mx = (sx + tx) / 2;

  return (
    <g>
      <path
        d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />
      <circle
        cx={mx}
        cy={(sy + ty) / 2}
        r={8}
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth={1}
        className="cursor-pointer opacity-0 hover:opacity-100"
        onClick={onDelete}
      />
      <text
        x={mx}
        y={(sy + ty) / 2 + 4}
        textAnchor="middle"
        fontSize={10}
        fill="#ef4444"
        className="pointer-events-none opacity-0 [g:hover>&]:opacity-100"
      >
        x
      </text>
    </g>
  );
}

export default function AgentBuilderPage() {
  const {
    flows,
    activeFlowId,
    addFlow,
    removeFlow,
    duplicateFlow,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    setActiveFlow,
    updateFlow,
  } = useAgentBuilderStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [newFlowName, setNewFlowName] = useState("");
  const [showNewFlow, setShowNewFlow] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // Drag-and-drop state
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const didDrag = useRef(false);

  const activeFlow = useMemo(
    () => flows.find((f) => f.id === activeFlowId) ?? null,
    [flows, activeFlowId]
  );

  const selectedNode = useMemo(
    () => activeFlow?.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [activeFlow, selectedNodeId]
  );

  // SVG coordinate conversion
  const getSVGPoint = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPoint = point.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }, []);

  const handleDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (!activeFlow) return;
      const node = activeFlow.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const pt = getSVGPoint(e);
      didDrag.current = false;
      setDragging({
        nodeId,
        startX: pt.x,
        startY: pt.y,
        origX: node.position.x,
        origY: node.position.y,
      });
    },
    [activeFlow, getSVGPoint]
  );

  const handleDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !activeFlowId) return;
      const pt = getSVGPoint(e);
      const dx = pt.x - dragging.startX;
      const dy = pt.y - dragging.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDrag.current = true;
      }
      const newX = Math.max(0, dragging.origX + dx);
      const newY = Math.max(0, dragging.origY + dy);
      updateNode(activeFlowId, dragging.nodeId, {
        position: { x: newX, y: newY },
      });
    },
    [dragging, activeFlowId, updateNode, getSVGPoint]
  );

  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, []);

  const handleAddNode = useCallback(
    (template: { type: FlowNodeType; label: string; config: Record<string, unknown> }) => {
      if (!activeFlowId) return;
      addNode(activeFlowId, {
        type: template.type,
        label: template.label,
        config: { ...template.config },
        position: { x: 0, y: 0 },
      });
    },
    [activeFlowId, addNode]
  );

  const handleCreateFlow = useCallback(() => {
    if (!newFlowName.trim()) return;
    addFlow(newFlowName.trim());
    setNewFlowName("");
    setShowNewFlow(false);
  }, [newFlowName, addFlow]);

  const handleExport = useCallback(() => {
    if (!activeFlow) return;
    const json = JSON.stringify(activeFlow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeFlow.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFlow]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (didDrag.current) return;
      if (connectingFrom) {
        if (connectingFrom !== nodeId && activeFlowId) {
          addEdge(activeFlowId, { source: connectingFrom, target: nodeId });
        }
        setConnectingFrom(null);
      } else {
        setSelectedNodeId(nodeId);
      }
    },
    [connectingFrom, activeFlowId, addEdge]
  );

  const svgViewBox = useMemo(() => {
    if (!activeFlow || activeFlow.nodes.length === 0) return "0 0 800 400";
    const maxX = Math.max(...activeFlow.nodes.map((n) => n.position.x + 200));
    const maxY = Math.max(...activeFlow.nodes.map((n) => n.position.y + 80));
    return `0 0 ${Math.max(800, maxX)} ${Math.max(400, maxY)}`;
  }, [activeFlow]);

  return (
    <ProGate feature="agent-builder" fallbackTitle="エージェントビルダー" fallbackDescription="エージェントビルダーはProプランでご利用いただけます。カスタムAIエージェントを構築できます。">
      <div className="flex h-screen flex-col bg-background">
        {/* Header */}
        <header className="flex h-14 items-center gap-3 border-b px-4">
        <Link href="/">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">エージェントビルダー</h1>

        <div className="ml-4 flex items-center gap-2">
          <Select
            value={activeFlowId ?? ""}
            onValueChange={(v) => {
              setActiveFlow(v);
              setSelectedNodeId(null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="フローを選択" />
            </SelectTrigger>
            <SelectContent>
              {flows.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showNewFlow ? (
            <div className="flex items-center gap-1">
              <Input
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                placeholder="フロー名"
                className="h-8 w-36"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFlow()}
              />
              <Button size="icon-sm" onClick={handleCreateFlow}>
                <Plus className="size-3" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setShowNewFlow(false)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowNewFlow(true)}>
              <Plus className="size-3" />
              新規作成
            </Button>
          )}
        </div>

        {activeFlow && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => duplicateFlow(activeFlow.id)}
            >
              <Copy className="size-3" />
              複製
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                removeFlow(activeFlow.id);
                setSelectedNodeId(null);
              }}
            >
              <Trash2 className="size-3" />
              削除
            </Button>
          </div>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <aside
          className={`${
            sidebarOpen ? "w-[200px]" : "w-0"
          } flex-shrink-0 overflow-hidden border-r transition-all duration-200`}
        >
          <ScrollArea className="h-full">
            <div className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  ノードパレット
                </span>
              </div>

              {(Object.keys(NODE_TEMPLATES) as FlowNodeType[]).map((type) => {
                const typeConfig = NODE_TYPE_CONFIG[type];
                const Icon = typeConfig.icon;

                return (
                  <div key={type} className="mb-3">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Icon className={`size-3 ${typeConfig.color}`} />
                      <span className={`text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {NODE_TEMPLATES[type].map((template, i) => (
                        <button
                          key={i}
                          onClick={() => handleAddNode(template)}
                          disabled={!activeFlowId}
                          className={`w-full rounded-md border p-2 text-left text-xs transition-colors ${typeConfig.bg} ${typeConfig.border} hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex w-6 items-center justify-center border-r bg-muted/30 hover:bg-muted/60"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-3 text-muted-foreground" />
          ) : (
            <PanelLeftOpen className="size-3 text-muted-foreground" />
          )}
        </button>

        {/* Center - Flow Canvas */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-muted/20 p-4">
            {!activeFlow ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Bot className="mx-auto mb-3 size-12 opacity-30" />
                  <p className="text-sm">フローを選択または新規作成してください</p>
                </div>
              </div>
            ) : activeFlow.nodes.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Plus className="mx-auto mb-3 size-12 opacity-30" />
                  <p className="text-sm">
                    左のパレットからノードを追加してください
                  </p>
                </div>
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox={svgViewBox}
                className="h-full w-full"
                style={{ minHeight: 400 }}
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#94a3b8"
                    />
                  </marker>
                </defs>

                {/* Edges */}
                {activeFlow.edges.map((edge) => {
                  const sourceNode = activeFlow.nodes.find((n) => n.id === edge.source);
                  const targetNode = activeFlow.nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  return (
                    <EdgePath
                      key={edge.id}
                      sourceNode={sourceNode}
                      targetNode={targetNode}
                      onDelete={() => removeEdge(activeFlow.id, edge.id)}
                    />
                  );
                })}

                {/* Nodes */}
                {activeFlow.nodes.map((node) => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isSelected={node.id === selectedNodeId}
                    onSelect={() => handleNodeClick(node.id)}
                    onDelete={() => {
                      removeNode(activeFlow.id, node.id);
                      if (selectedNodeId === node.id) setSelectedNodeId(null);
                    }}
                    onDragStart={(e) => handleDragStart(node.id, e)}
                  />
                ))}
              </svg>
            )}
          </div>

          {/* Footer */}
          {activeFlow && (
            <footer className="flex items-center gap-2 border-t px-4 py-2">
              <Badge variant="secondary" className="text-xs">
                ノード: {activeFlow.nodes.length}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                接続: {activeFlow.edges.length}
              </Badge>

              {connectingFrom ? (
                <div className="ml-2 flex items-center gap-2">
                  <span className="text-xs text-amber-600">
                    接続先のノードをクリック
                  </span>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setConnectingFrom(null)}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                selectedNodeId && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setConnectingFrom(selectedNodeId)}
                  >
                    <GitBranch className="size-3" />
                    接続を追加
                  </Button>
                )
              )}

              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleExport}>
                  <Download className="size-3" />
                  エクスポート
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateFlow(activeFlow.id, { updatedAt: Date.now() });
                  }}
                >
                  <Save className="size-3" />
                  保存
                </Button>
                <Button size="sm">
                  <Play className="size-3" />
                  テスト実行
                </Button>
              </div>
            </footer>
          )}
        </main>

        {/* Right Sidebar - Node Config Panel */}
        {selectedNode && activeFlow && (
          <aside className="w-[280px] flex-shrink-0 border-l">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">ノード設定</h3>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>

                <Card className="gap-3 py-3">
                  <CardHeader className="px-3 py-0">
                    <CardTitle className="text-xs">基本情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-3">
                    <div>
                      <Label className="text-xs">タイプ</Label>
                      <Badge
                        className={`mt-1 ${NODE_TYPE_CONFIG[selectedNode.type].bg} ${NODE_TYPE_CONFIG[selectedNode.type].color} border ${NODE_TYPE_CONFIG[selectedNode.type].border}`}
                        variant="outline"
                      >
                        {NODE_TYPE_CONFIG[selectedNode.type].label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs">ラベル</Label>
                      <Input
                        value={selectedNode.label}
                        onChange={(e) =>
                          updateNode(activeFlow.id, selectedNode.id, {
                            label: e.target.value,
                          })
                        }
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-3 gap-3 py-3">
                  <CardHeader className="px-3 py-0">
                    <CardTitle className="text-xs">パラメータ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-3">
                    {Object.entries(selectedNode.config).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-xs">{key}</Label>
                        {typeof value === "string" ? (
                          <Input
                            value={value}
                            onChange={(e) =>
                              updateNode(activeFlow.id, selectedNode.id, {
                                config: {
                                  ...selectedNode.config,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            className="mt-1 h-8 text-xs"
                          />
                        ) : (
                          <Input
                            value={JSON.stringify(value)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                updateNode(activeFlow.id, selectedNode.id, {
                                  config: {
                                    ...selectedNode.config,
                                    [key]: parsed,
                                  },
                                });
                              } catch {
                                // Invalid JSON, keep current value
                              }
                            }}
                            className="mt-1 h-8 text-xs font-mono"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="mt-3 gap-3 py-3">
                  <CardHeader className="px-3 py-0">
                    <CardTitle className="text-xs">接続</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">接続先を追加</Label>
                      <Select
                        onValueChange={(targetId) => {
                          addEdge(activeFlow.id, {
                            source: selectedNode.id,
                            target: targetId,
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue placeholder="ノードを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeFlow.nodes
                            .filter((n) => n.id !== selectedNode.id)
                            .map((n) => (
                              <SelectItem key={n.id} value={n.id}>
                                {n.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {activeFlow.edges
                      .filter(
                        (e) =>
                          e.source === selectedNode.id ||
                          e.target === selectedNode.id
                      )
                      .map((edge) => {
                        const other = activeFlow.nodes.find(
                          (n) =>
                            n.id ===
                            (edge.source === selectedNode.id
                              ? edge.target
                              : edge.source)
                        );
                        const direction =
                          edge.source === selectedNode.id ? "→" : "←";
                        return (
                          <div
                            key={edge.id}
                            className="flex items-center justify-between rounded-md border px-2 py-1"
                          >
                            <span className="text-xs">
                              {direction} {other?.label ?? "不明"}
                            </span>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() =>
                                removeEdge(activeFlow.id, edge.id)
                              }
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
      </div>
    </ProGate>
  );
}
