"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/apiClient";
import { useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    canonical_id: z.string().min(1, "Dormitory ID is required"),
    email_alert: z.boolean(),
});

type SubsWizardProps = {
    onSubAdded: () => void;
    onCancel: () => void;
};

export function SubsWizard({ onSubAdded, onCancel }: SubsWizardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            canonical_id: "",
            email_alert: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post("/subs", values);
            onSubAdded();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="canonical_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dormitory ID</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., 5-202, E-505"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email_alert"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Notification
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Receive notifications on low electricity.
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                        onClick={() => {
                            form.reset();
                            onCancel();
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {isLoading ? "Adding..." : "Add Subscription"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
