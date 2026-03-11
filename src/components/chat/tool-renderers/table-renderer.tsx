"use client";

import { useState, useMemo, memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server } from "lucide-react";
import { generateTableApi } from "@/lib/api-generator";
import { ApiRoutePreview } from "@/components/shared/api-route-preview";

type Column = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "badge" | "link";
  align: "left" | "center" | "right";
};

type TableRendererProps = {
  title: string;
  description?: string;
  columns: Column[];
  rows: Record<string, string>[];
  striped: boolean;
};

export const TableRenderer = memo(function TableRenderer({
  title,
  description,
  columns,
  rows,
  striped,
}: TableRendererProps) {
  const [showApi, setShowApi] = useState(false);

  const apiRoute = useMemo(
    () => generateTableApi({ title, columns, rows }),
    [title, columns, rows]
  );

  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowApi(!showApi)}
              aria-label="API生成"
              title="API生成"
            >
              <Server className="h-3.5 w-3.5" />
            </Button>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 font-medium text-muted-foreground ${alignClass[col.align]}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b last:border-0 ${
                      striped && i % 2 === 1 ? "bg-muted/50" : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${alignClass[col.align]}`}
                      >
                        {col.type === "badge" ? (
                          <Badge variant="secondary">{row[col.key]}</Badge>
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {showApi && <ApiRoutePreview route={apiRoute} />}
    </div>
  );
});
