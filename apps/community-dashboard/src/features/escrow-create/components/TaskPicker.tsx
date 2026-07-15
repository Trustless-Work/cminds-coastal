"use client";

import type { TaskRecord } from "@repo/features/escrow/services/tasks.service";
import type { UserSearchResult } from "@repo/features/auth/services/users-search.service";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";

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
  const byCategory = tasks.reduce<Record<string, TaskRecord[]>>((acc, task) => {
    const list = acc[task.category] ?? [];
    list.push(task);
    acc[task.category] = list;
    return acc;
  }, {});

  const x01Selected = tasks.some(
    (task) => task.code === "X-01" && selectedTaskIds.includes(task.task_id),
  );

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([category, categoryTasks]) => (
        <section key={category} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {category}
          </h3>
          <div className="space-y-3">
            {categoryTasks.map((task) => {
              const selected = selectedTaskIds.includes(task.task_id);
              const receiver =
                receivers[task.task_id] ?? createDefaultReceiver();
              return (
                <Card
                  key={task.task_id}
                  size="sm"
                  className={cn(selected && "ring-2 ring-primary/40")}
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0 @[0px]:grid-cols-none">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(checked) => {
                        if (checked !== selected) {
                          onToggle(task.task_id);
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{task.code}</Badge>
                        <CardTitle className="text-base">{task.name}</CardTitle>
                      </div>
                      <CardDescription>
                        {task.expected_deliverable}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  {selected ? (
                    <CardContent>
                      <Label htmlFor={`amount-${task.task_id}`}>
                        Fixed amount (USDC)
                      </Label>
                      <Input
                        id={`amount-${task.task_id}`}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="mt-1.5"
                        value={amounts[task.task_id] ?? ""}
                        onChange={(event) =>
                          onAmountChange(task.task_id, event.target.value)
                        }
                      />
                      {amountErrors?.[task.task_id] ? (
                        <p className="mt-1.5 text-sm text-destructive">
                          {amountErrors[task.task_id]}
                        </p>
                      ) : null}
                      <MilestoneReceiverField
                        taskId={task.task_id}
                        value={receiver}
                        selectedUser={receiverUsers[task.task_id] ?? null}
                        onChange={(value) =>
                          onReceiverChange(task.task_id, value)
                        }
                        onUserChange={(user) =>
                          onReceiverUserChange(task.task_id, user)
                        }
                        error={receiverErrors?.[task.task_id]}
                      />
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {x01Selected ? (
        <div className="space-y-2">
          <Label htmlFor="custom-description">Custom task details (X-01)</Label>
          <Textarea
            id="custom-description"
            value={customDescription ?? ""}
            onChange={(event) => onCustomDescriptionChange(event.target.value)}
            placeholder="Describe the custom deliverable"
          />
        </div>
      ) : null}
    </div>
  );
};
