"use client";

import { Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

type Props = {
  children: ReactNode;
  fallbackMessage?: string;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {this.props.fallbackMessage || "コンポーネントの表示中にエラーが発生しました"}
              </p>
              {this.state.error && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              再試行
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
