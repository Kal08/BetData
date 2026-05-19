"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { entrySchema, type EntryInput } from "@/lib/validations";
import { toDateInputValue } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";

export interface EntryRecord {
  id: string;
  date: string;
  system: number;
  online: number;
  number: number;
  bonus: number;
  win: number;
  cash: number;
  note: string | null;
}

interface EntryFormProps {
  initial?: EntryRecord;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function EntryForm({ initial, onSuccess, onCancel }: EntryFormProps) {
  const [loading, setLoading] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: initial
      ? {
          date: toDateInputValue(initial.date),
          system: initial.system,
          online: initial.online,
          number: initial.number,
          bonus: initial.bonus,
          win: initial.win,
          cash: initial.cash,
          note: initial.note ?? "",
        }
      : {
          date: toDateInputValue(new Date()),
          system: 0,
          online: 0,
          number: 0,
          bonus: 0,
          win: 0,
          cash: 0,
          note: "",
        },
  });

  const onSubmit = async (data: EntryInput) => {
    setLoading(true);
    try {
      const url = initial ? `/api/entries/${initial.id}` : "/api/entries";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          number: data.number ?? 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      addToast({
        type: "success",
        title: initial ? "Entry updated" : "Entry submitted",
      });
      onSuccess();
    } catch (e) {
      addToast({
        type: "error",
        title: e instanceof Error ? e.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? "Edit Entry" : "New Entry"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
            {(
              [
                ["system", "System"],
                ["online", "Online"],
                ["number", "Number"],
                ["bonus", "Bonus"],
                ["win", "Win"],
                ["cash", "Cash"],
              ] as const
            ).map(([name, label]) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  type="number"
                  step="any"
                  {...register(name, { valueAsNumber: true })}
                />
                {errors[name] && (
                  <p className="text-xs text-destructive">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial ? "Update" : "Submit"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
