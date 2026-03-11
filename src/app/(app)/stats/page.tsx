"use client";

import { useHistoryStore } from "@/stores/history-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useVersionStore } from "@/stores/version-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  History,
  Star,
  Layers,
  Wrench,
  Tag,
  MessageSquare,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TOOL_LABELS } from "@/lib/shared-constants";

const TOOL_COLORS: Record<string, string> = {
  showForm: "#3b82f6",
  showTable: "#22c55e",
  showChart: "#f59e0b",
  generateCustomComponent: "#a855f7",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return new Date(timestamp).toLocaleDateString("ja-JP");
}

export default function StatsPage() {
  const entries = useHistoryStore((s) => s.entries);
  const favorites = useFavoritesStore((s) => s.favorites);
  const versions = useVersionStore((s) => s.versions);

  // KPI calculations
  const totalGenerations = entries.length;
  const totalFavorites = favorites.length;
  const totalVersions = versions.length;

  const { uniqueTools, toolDistribution, timelineData, topKeywords, recentActivity } = useMemo(() => {
    const toolSet = new Set<string>();
    const toolCounts: Record<string, number> = {};
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const dayCounts: Record<string, number> = {};
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set([
      "の", "を", "に", "は", "で", "と", "が", "も", "な", "た", "し", "て",
      "する", "ます", "です", "こと", "もの", "ない", "ある", "いる",
      "a", "the", "is", "to", "and", "of", "in", "for", "with", "on", "that", "it", "this",
    ]);

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      dayCounts[date.toISOString().split("T")[0]] = 0;
    }

    for (const entry of entries) {
      toolSet.add(entry.toolName);
      toolCounts[entry.toolName] = (toolCounts[entry.toolName] || 0) + 1;

      if (entry.timestamp >= thirtyDaysAgo) {
        const key = new Date(entry.timestamp).toISOString().split("T")[0];
        if (key in dayCounts) dayCounts[key]++;
      }

      const words = entry.prompt
        .replace(/[、。！？\s,.:;!?()（）「」]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 2 && !stopWords.has(w.toLowerCase()));
      for (const word of words) {
        const lower = word.toLowerCase();
        wordCounts[lower] = (wordCounts[lower] || 0) + 1;
      }
    }

    return {
      uniqueTools: toolSet.size,
      toolDistribution: Object.entries(toolCounts).map(([name, value]) => ({
        name: TOOL_LABELS[name] || name,
        value,
        color: TOOL_COLORS[name] || "#6b7280",
      })),
      timelineData: Object.entries(dayCounts).map(([date, count]) => ({
        date: formatDate(new Date(date).getTime()),
        count,
      })),
      topKeywords: Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count })),
      recentActivity: entries.slice(0, 5),
    };
  }, [entries]);

  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    for (const fav of favorites) {
      for (const tag of fav.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [favorites]);

  const kpiCards = [
    {
      label: "総生成数",
      value: totalGenerations,
      icon: History,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "お気に入り数",
      value: totalFavorites,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "バージョン数",
      value: totalVersions,
      icon: Layers,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "使用ツール種類",
      value: uniqueTools,
      icon: Wrench,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">統計ダッシュボード</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4 pt-0">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${kpi.bg}`}
                >
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row 2: Tool Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ツール分布</CardTitle>
          </CardHeader>
          <CardContent>
            {toolDistribution.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                データがありません
              </p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={toolDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {toolDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value ?? 0}件`, "回数"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Row 3: Generation Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">生成タイムライン</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                データがありません
              </p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value ?? 0}件`, "生成数"]}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Row 4: Activity Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Top Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                よく使うプロンプト
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topKeywords.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  データがありません
                </p>
              ) : (
                <div className="space-y-2">
                  {topKeywords.map(({ word, count }) => (
                    <div
                      key={word}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate text-sm">{word}</span>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4 text-muted-foreground" />
                人気のタグ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  タグがありません
                </p>
              ) : (
                <div className="space-y-2">
                  {topTags.map(({ tag, count }) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate text-sm">{tag}</span>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-muted-foreground" />
                最近のアクティビティ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  アクティビティがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2">
                      <div
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            TOOL_COLORS[entry.toolName] || "#6b7280",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          {TOOL_LABELS[entry.toolName] || entry.toolName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {relativeTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
