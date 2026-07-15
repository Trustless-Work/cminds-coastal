"use client";

import { useMemo, useState } from "react";
import type { TaskRecord } from "@repo/features/escrow/services/tasks.service";
import type { UserSearchResult } from "@repo/features/auth/services/users-search.service";
import { Badge } from "@repo/ui/components/badge";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";
import { X } from "lucide-react";

import {
  createDefaultReceiver,
  type TaskReceiverValue,
} from "../schemas/create-escrow.schema";
import { MilestoneReceiverField } from "./MilestoneReceiverField";

type TaskPickerProps = {
  tasks: TaskRecord[];
  selectedTaskIds: string[];
  amounts: Record<string, string>;
  receivers: Record<string, TaskReceiverValue>;
  receiverUsers: Record<string, UserSearchResult | null>;
  customDescription?: string;
  receiverErrors?: Record<string, string | undefined>;
  amountErrors?: Record<string, string | undefined>;
  onToggle: (taskId: string) => void;
  onAmountChange: (taskId: string, value: string) => void;
  onReceiverChange: (taskId: string, value: TaskReceiverValue) => void;
  onReceiverUserChange: (
    taskId: string,
    user: UserSearchResult | null,
  ) => void;
  onCustomDescriptionChange: (value: string) => void;
};

export const TaskPicker = ({
  tasks,
  selectedTaskIds,
  amounts,
  receivers,
  receiverUsers,
  customDescription,
  receiverErrors,
  amountErrors,
  onToggle,
  onAmountChange,
  onReceiverChange,
  onReceiverUserChange,
  onCustomDescriptionChange,
}: TaskPickerProps) => {
  const categories = useMemo(() => {
    const map = new Map<string, TaskRecord[]>();
    for (const task of tasks) {
      const list = map.get(task.category) ?? [];
      list.push(task);
      map.set(task.category, list);
    }
    return [...map.entries()];
  }, [tasks]);

  const [activeCategory, setActiveCategory] = useState<string>(
    () => categories[0]?.[0] ?? "",
  );

  const selectedTasks = useMemo(
    () => tasks.filter((task) => selectedTaskIds.includes(task.task_id)),
    [tasks, selectedTaskIds],
  );

  const x01Selected = selectedTasks.some((task) => task.code === "X-01");

  const resolvedCategory =
    categories.some(([name]) => name === activeCategory)
      ? activeCategory
      : (categories[0]?.[0] ?? "");

  const activeTasks =
    categories.find(([name]) => name === resolvedCategory)?.[1] ?? [];

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No tasks available.</p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Categories
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map(([category, categoryTasks]) => {
            const count = categoryTasks.filter((task) =>
              selectedTaskIds.includes(task.task_id),
            ).length;
            const active = category === resolvedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-white text-foreground hover:border-foreground/40",
                )}
              >
                <span>{category}</span>
                {count > 0 ? (
                  <span
                    className={cn(
                      "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                      active
                        ? "bg-background/20 text-background"
                        : "bg-[#F3F3F3] text-foreground",
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl ring-1 ring-border/80">
          <div className="border-b border-border/80 bg-[#F8F8F8] px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              {resolvedCategory}
            </p>
            <p className="text-xs text-muted-foreground">
              Tap a task to add it as a milestone.
            </p>
          </div>
          <ul className="divide-y divide-border/80">
            {activeTasks.map((task) => {
              const selected = selectedTaskIds.includes(task.task_id);
              return (
                <li key={task.task_id}>
                  <button
                    type="button"
                    onClick={() => onToggle(task.task_id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F8F8F8]",
                      selected && "bg-[#F8F8F8]",
                    )}
                  >
                    <Checkbox
                      checked={selected}
                      tabIndex={-1}
                      className="pointer-events-none mt-0.5"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {task.code}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">
                          {task.name}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {task.expected_deliverable}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">
              Selected Milestones
            </h3>
            <p className="text-xs text-muted-foreground">
              Set a fixed USDC amount and receiver for each task.
            </p>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {selectedTasks.length} selected
          </span>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
            Pick tasks from a category above. They appear here to configure.
          </div>
        ) : (
          <ul className="space-y-4">
            {selectedTasks.map((task) => {
              const receiver =
                receivers[task.task_id] ?? createDefaultReceiver();
              return (
                <li
                  key={task.task_id}
                  className="space-y-4 rounded-2xl bg-[#F8F8F8] p-4 ring-1 ring-border/60 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-white font-mono text-[10px]"
                        >
                          {task.code}
                        </Badge>
                        <span className="text-sm font-medium">{task.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {task.category}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggle(task.task_id)}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                      aria-label={`Remove ${task.code}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`amount-${task.task_id}`}>
                      Fixed Amount (USDC)
                    </Label>
                    <Input
                      id={`amount-${task.task_id}`}
                      inputMode="decimal"
                      placeholder="e.g. 250.00"
                      value={amounts[task.task_id] ?? ""}
                      onChange={(event) =>
                        onAmountChange(task.task_id, event.target.value)
                      }
                    />
                    {amountErrors?.[task.task_id] ? (
                      <p className="text-sm text-destructive">
                        {amountErrors[task.task_id]}
                      </p>
                    ) : null}
                  </div>

                  <MilestoneReceiverField
                    taskId={task.task_id}
                    value={receiver}
                    selectedUser={receiverUsers[task.task_id] ?? null}
                    onChange={(value) => onReceiverChange(task.task_id, value)}
                    onUserChange={(user) =>
                      onReceiverUserChange(task.task_id, user)
                    }
                    error={receiverErrors?.[task.task_id]}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {x01Selected ? (
        <>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="custom-description">
              Custom Task Details (X-01)
            </Label>
            <Textarea
              id="custom-description"
              value={customDescription ?? ""}
              onChange={(event) =>
                onCustomDescriptionChange(event.target.value)
              }
              placeholder="Describe the custom deliverable for X-01…"
            />
          </div>
        </>
      ) : null}
    </div>
  );
};
