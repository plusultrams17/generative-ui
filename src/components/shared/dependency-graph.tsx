"use client";

import { useState, useMemo } from "react";
import type { DependencyGraph, DepNode, DepNodeType } from "@/lib/dependency-analyzer";

type DependencyGraphViewProps = {
  graph: DependencyGraph;
};

const TYPE_COLORS: Record<DepNodeType, string> = {
  component: "#3b82f6",
  hook: "#a855f7",
  library: "#f97316",
  html: "#22c55e",
  style: "#ec4899",
  utility: "#6b7280",
};

const TYPE_LABELS: Record<DepNodeType, string> = {
  component: "コンポーネント",
  hook: "フック",
  library: "ライブラリ",
  html: "HTML要素",
  style: "スタイル",
  utility: "ユーティリティ",
};

const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const NODE_RADIUS = 20;

type NodePosition = { x: number; y: number; node: DepNode };

function computeLayout(graph: DependencyGraph): NodePosition[] {
  const positions: NodePosition[] = [];
  const root = graph.nodes.find((n) => n.id === graph.rootId);
  if (!root) return positions;

  const centerX = SVG_WIDTH / 2;
  const centerY = 60;

  positions.push({ x: centerX, y: centerY, node: root });

  // Group non-root nodes by type
  const groups: Record<string, DepNode[]> = {};
  for (const node of graph.nodes) {
    if (node.id === graph.rootId) continue;
    if (!groups[node.type]) groups[node.type] = [];
    groups[node.type].push(node);
  }

  const groupKeys = Object.keys(groups);
  const numGroups = groupKeys.length;
  if (numGroups === 0) return positions;

  const baseRadius = 140;
  const sectorAngle = (Math.PI * 2) / numGroups;
  // Start from bottom (PI/2) and distribute evenly
  const startAngle = Math.PI / 2 - sectorAngle * (numGroups - 1) / 2;

  groupKeys.forEach((type, gi) => {
    const nodesInGroup = groups[type];
    const angle = startAngle + gi * sectorAngle;
    const groupCenterX = centerX + Math.cos(angle) * baseRadius;
    const groupCenterY = centerY + Math.sin(angle) * baseRadius;

    if (nodesInGroup.length === 1) {
      positions.push({ x: groupCenterX, y: groupCenterY, node: nodesInGroup[0] });
    } else {
      // Spread nodes within the group
      const spread = Math.min(50, 200 / nodesInGroup.length);
      const halfWidth = ((nodesInGroup.length - 1) * spread) / 2;
      // Perpendicular direction for spreading
      const perpAngle = angle + Math.PI / 2;
      nodesInGroup.forEach((node, ni) => {
        const offset = ni * spread - halfWidth;
        const x = groupCenterX + Math.cos(perpAngle) * offset;
        const y = groupCenterY + Math.sin(perpAngle) * offset;
        positions.push({ x, y, node });
      });
    }
  });

  return positions;
}

export function DependencyGraphView({ graph }: DependencyGraphViewProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const positions = useMemo(() => computeLayout(graph), [graph]);

  const positionMap = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    for (const p of positions) {
      map[p.node.id] = { x: p.x, y: p.y };
    }
    return map;
  }, [positions]);

  const hoveredInfo = useMemo(() => {
    if (!hoveredNode) return null;
    const pos = positions.find((p) => p.node.id === hoveredNode);
    if (!pos) return null;
    return pos;
  }, [hoveredNode, positions]);

  // Summary counts by type
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<DepNodeType, number>> = {};
    for (const node of graph.nodes) {
      if (node.id === graph.rootId) continue;
      counts[node.type] = (counts[node.type] || 0) + 1;
    }
    return counts;
  }, [graph]);

  if (graph.nodes.length <= 1) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 mb-3 text-center text-sm text-muted-foreground">
        依存関係が検出されませんでした
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 mb-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">依存関係グラフ</span>
        {Object.entries(typeCounts).map(([type, count]) => (
          <span
            key={type}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: TYPE_COLORS[type as DepNodeType] }}
          >
            {TYPE_LABELS[type as DepNodeType]}: {count}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full"
        style={{ maxHeight: 400 }}
      >
        <defs>
          <marker
            id="dep-arrow"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {graph.edges.map((edge, i) => {
          const from = positionMap[edge.from];
          const to = positionMap[edge.to];
          if (!from || !to) return null;

          // Shorten line to not overlap circles
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;
          const nx = dx / dist;
          const ny = dy / dist;
          const x1 = from.x + nx * NODE_RADIUS;
          const y1 = from.y + ny * NODE_RADIUS;
          const x2 = to.x - nx * NODE_RADIUS;
          const y2 = to.y - ny * NODE_RADIUS;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94a3b8"
              strokeWidth={1}
              opacity={0.6}
              markerEnd="url(#dep-arrow)"
            />
          );
        })}

        {/* Nodes */}
        {positions.map((pos) => {
          const isHovered = hoveredNode === pos.node.id;
          const isRoot = pos.node.id === graph.rootId;
          const r = isRoot ? NODE_RADIUS + 4 : NODE_RADIUS;
          // Truncate label
          const maxLen = isRoot ? 12 : 8;
          const label = pos.node.label.length > maxLen
            ? pos.node.label.slice(0, maxLen - 1) + "…"
            : pos.node.label;

          return (
            <g
              key={pos.node.id}
              onMouseEnter={() => setHoveredNode(pos.node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={TYPE_COLORS[pos.node.type]}
                stroke={isHovered ? "#fff" : "rgba(255,255,255,0.3)"}
                strokeWidth={isHovered ? 2.5 : 1.5}
                opacity={isHovered ? 1 : 0.9}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isRoot ? 8 : 9}
                fill="white"
                fontWeight={isRoot ? 700 : 500}
                pointerEvents="none"
              >
                {label}
              </text>
              {pos.node.count > 1 && (
                <g>
                  <circle
                    cx={pos.x + r * 0.7}
                    cy={pos.y - r * 0.7}
                    r={7}
                    fill="#1e293b"
                    stroke={TYPE_COLORS[pos.node.type]}
                    strokeWidth={1}
                  />
                  <text
                    x={pos.x + r * 0.7}
                    y={pos.y - r * 0.7 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={8}
                    fill="white"
                    fontWeight={600}
                    pointerEvents="none"
                  >
                    {pos.node.count}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredInfo && (
          <g>
            <rect
              x={Math.min(hoveredInfo.x + 25, SVG_WIDTH - 140)}
              y={hoveredInfo.y - 30}
              width={130}
              height={42}
              rx={6}
              fill="rgba(15,23,42,0.92)"
              stroke="rgba(148,163,184,0.3)"
              strokeWidth={1}
            />
            <text
              x={Math.min(hoveredInfo.x + 30, SVG_WIDTH - 135)}
              y={hoveredInfo.y - 12}
              fontSize={10}
              fill="white"
              fontWeight={600}
            >
              {hoveredInfo.node.label}
            </text>
            <text
              x={Math.min(hoveredInfo.x + 30, SVG_WIDTH - 135)}
              y={hoveredInfo.y + 2}
              fontSize={9}
              fill="#94a3b8"
            >
              {TYPE_LABELS[hoveredInfo.node.type]} | 使用: {hoveredInfo.node.count}回
            </text>
          </g>
        )}

        {/* Legend */}
        {Object.entries(TYPE_COLORS).map(([type, color], i) => (
          <g key={type} transform={`translate(${SVG_WIDTH - 110}, ${SVG_HEIGHT - 110 + i * 16})`}>
            <circle cx={6} cy={0} r={5} fill={color} />
            <text x={16} y={1} fontSize={9} fill="#94a3b8" dominantBaseline="middle">
              {TYPE_LABELS[type as DepNodeType]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
