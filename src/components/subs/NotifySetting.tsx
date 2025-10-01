/* eslint-disable @next/next/no-img-element */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NotifyChannel, Subscription } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import { Loader2, Check } from "lucide-react";

const formSchema = z
    .object({
        notify_channel: z.enum(["none", "wxwork", "feishu", "serverchan"]),
        notify_token: z.string().optional(),
        threshold_kwh_enabled: z.boolean(),
        threshold_kwh: z.number().optional(),
        within_hours_enabled: z.boolean(),
        within_hours: z.number().optional(),
        cooldown_sec: z.number(),
    })
    .refine(
        (data) => {
            if (data.notify_channel !== "none" && !data.notify_token) {
                return false;
            }
            return true;
        },
        { message: "Token is required", path: ["notify_token"] }
    )
    .refine(
        (data) => {
            const { notify_channel, notify_token } = data;
            if (notify_channel === "none") {
                return true;
            }
            if (!notify_token) {
                return false; // Token is required if channel is not 'none'
            }

            const re = {
                serverchan: /^(SCT[0-9A-Za-z]+)$/,
                uuid: /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
            };

            if (notify_channel === "serverchan") {
                return re.serverchan.test(notify_token);
            }
            if (notify_channel === "wxwork" || notify_channel === "feishu") {
                return re.uuid.test(notify_token);
            }

            return false; // Should not be reached if channel is valid
        },
        { message: "Token is invalid or does not match the selected channel", path: ["notify_token"] }
    )
    .refine(
        (data) => {
            if (
                data.threshold_kwh_enabled &&
                (data.threshold_kwh === undefined || data.threshold_kwh <= 0)
            ) {
                return false;
            }
            return true;
        },
        { message: "Must be a positive number", path: ["threshold_kwh"] }
    )
    .refine(
        (data) => {
            if (
                data.within_hours_enabled &&
                (data.within_hours === undefined || data.within_hours <= 0)
            ) {
                return false;
            }
            return true;
        },
        { message: "Must be a positive number", path: ["within_hours"] }
    );

type NotifySettingProps = {
    sub: Subscription;
    onSuccess: () => void;
    onSubDeleted: () => void;
};

const ChannelIcon = ({ channel }: { channel: string }) => {
    const iconMap: Record<string, string> = {
        wxwork: "/wxwork.svg",
        feishu: "/feishu.svg",
        serverchan: "/serverchan.png",
        none: "/mute.svg",
    };
    const src = iconMap[channel];
    if (!src) return null;
    return <img src={src} alt={channel} className="w-5 h-5 mr-2" />;
};

export function NotifySetting({
    sub,
    onSuccess,
    onSubDeleted,
}: NotifySettingProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<{
        ok: boolean;
        message: string;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            notify_channel: sub.notify_channel,
            notify_token: sub.notify_token || "",
            threshold_kwh_enabled: sub.threshold_kwh > 0,
            threshold_kwh:
                sub.threshold_kwh > 0 ? sub.threshold_kwh : undefined,
            within_hours_enabled: sub.within_hours > 0,
            within_hours: sub.within_hours > 0 ? sub.within_hours : undefined,
            cooldown_sec: sub.cooldown_sec,
        },
    });

    const {
        watch,
        setValue,
        handleSubmit,
        control,
        getValues,
        trigger, // <-- get trigger from useForm
        formState: { isValid },
    } = form;
    const notifyChannel = watch("notify_channel");

    // Re-validate token when channel changes
    const isFirstRender = useRef(true);
    useEffect(() => {
        // Skip validation on the initial render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        trigger("notify_token");
    }, [notifyChannel, trigger]);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setTestStatus(null); // Clear test status on new input

        let channel: NotifyChannel | null = null;
        let token = value;

        const re = {
            wxwork: /qyapi\.weixin\.qq\.com\/cgi-bin\/webhook\/send\?key=([0-9a-z\-]+)/i,
            feishu: /open\.feishu\.cn\/open-apis\/bot\/v2\/hook\/([0-9a-f\-]+)/i,
            serverchan_url: /sctapi\.ftqq\.com\/(SCT[0-9A-Za-z]+)\.send/i,
            serverchan_token: /^(SCT[0-9A-Za-z]+)$/,
            uuid: /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
        };

        const wxworkMatch = value.match(re.wxwork);
        const feishuMatch = value.match(re.feishu);
        const serverchanUrlMatch = value.match(re.serverchan_url);
        const serverchanTokenMatch = value.match(re.serverchan_token);
        const uuidMatch = value.match(re.uuid);

        if (wxworkMatch) {
            channel = "wxwork";
            token = wxworkMatch[1];
        } else if (feishuMatch) {
            channel = "feishu";
            token = feishuMatch[1];
        } else if (serverchanUrlMatch) {
            channel = "serverchan";
            token = serverchanUrlMatch[1];
        } else if (serverchanTokenMatch) {
            channel = "serverchan";
            token = serverchanTokenMatch[0];
        } else if (uuidMatch) {
            // Pasted a raw UUID token. Default to wxwork, user can change to feishu if needed.
            channel = "wxwork";
            token = uuidMatch[0];
        }

        if (channel) {
            setValue("notify_channel", channel, { shouldValidate: true });
        }

        // Update token field, even if no channel was detected
        setValue("notify_token", token, { shouldValidate: true });
    };

    async function onTest() {
        const { notify_channel, notify_token } = getValues();
        if (!notify_token) {
            setTestStatus({
                ok: false,
                message: "Token is required to send a test notification.",
            });
            return;
        }

        setIsTesting(true);
        setTestStatus(null);

        try {
            const result = await apiClient.post("/subs/test-notify", {
                notify_channel,
                notify_token,
                canonical_id: sub.canonical_id
            });

            if (result.ok) {
                setTestStatus({ ok: true, message: "Test successful!" });
            } else {
                throw new Error(
                    result.error || "Failed to send test notification."
                );
            }
        } catch (err: unknown) {
            setTestStatus({
                ok: false,
                message: (err as Error).message || "An unknown error occurred.",
            });
        } finally {
            setIsTesting(false);
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this subscription?")) {
            try {
                await apiClient.delete(`/subs/${sub.hashed_dir}`);
                onSubDeleted();
            } catch (err) {
                if (err instanceof Error) {
                    alert(`Error: ${err.message}`);
                } else {
                    alert("An unknown error occurred");
                }
            }
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const dataToSubmit = {
            ...values,
            threshold_kwh: values.threshold_kwh_enabled
                ? values.threshold_kwh
                : 0,
            within_hours: values.within_hours_enabled ? values.within_hours : 0,
        };

        setIsSubmitting(true);
        try {
            await apiClient.put(`/subs/${sub.hashed_dir}`, dataToSubmit);
            onSuccess();
        } catch (err) {
            if (err instanceof Error) {
                alert(`Error: ${err.message}`);
            } else {
                alert("An unknown error occurred");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={control}
                    name="notify_channel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notification Channel</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    setTestStatus(null);
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a channel" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <div className="flex items-center">
                                            <ChannelIcon channel="none" /> None
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="wxwork">
                                        <div className="flex items-center">
                                            <ChannelIcon channel="wxwork" />{" "}
                                            WeCom
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="feishu">
                                        <div className="flex items-center">
                                            <ChannelIcon channel="feishu" />{" "}
                                            Feishu
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="serverchan">
                                        <div className="flex items-center">
                                            <ChannelIcon channel="serverchan" />{" "}
                                            ServerChan
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {notifyChannel !== "none" && (
                    <>
                        <FormField
                            control={control}
                            name="notify_token"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Notification Token / Webhook URL
                                    </FormLabel>
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Input
                                                placeholder="Paste Webhook URL or Token"
                                                {...field}
                                                onChange={handleTokenChange}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            onClick={onTest}
                                            disabled={
                                                isTesting ||
                                                !watch("notify_token")
                                            }
                                            size="icon"
                                            variant="outline"
                                        >
                                            {isTesting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : testStatus?.ok ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <span className="text-sm">
                                                    Test
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                    {testStatus && !testStatus.ok && (
                                        <FormDescription className="text-red-500">
                                            Test Failed: {testStatus.message}
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-lg border p-4 space-y-4">
                            <FormField
                                control={control}
                                name="threshold_kwh_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                Low Power Threshold
                                            </FormLabel>
                                            <FormDescription>
                                                Notify when power is below a
                                                certain kWh.
                                            </FormDescription>
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
                            {watch("threshold_kwh_enabled") && (
                                <FormField
                                    control={control}
                                    name="threshold_kwh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 10"
                                                        {...field}
                                                        value={
                                                            field.value ?? ""
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value ===
                                                                    ""
                                                                    ? undefined
                                                                    : parseFloat(
                                                                          e
                                                                              .target
                                                                              .value
                                                                      )
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                                                    kWh
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="rounded-lg border p-4 space-y-4">
                            <FormField
                                control={control}
                                name="within_hours_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                Depletion Threshold
                                            </FormLabel>
                                            <FormDescription>
                                                Notify when power is estimated
                                                to run out soon.
                                            </FormDescription>
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
                            {watch("within_hours_enabled") && (
                                <FormField
                                    control={control}
                                    name="within_hours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 24"
                                                        {...field}
                                                        value={
                                                            field.value ?? ""
                                                        }
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target
                                                                    .value ===
                                                                    ""
                                                                    ? undefined
                                                                    : parseFloat(
                                                                          e
                                                                              .target
                                                                              .value
                                                                      )
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                                                    hours
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={control}
                            name="cooldown_sec"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cooldown</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(parseInt(value, 10))
                                        }
                                        defaultValue={String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a cooldown period" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="43200">
                                                12 hours
                                            </SelectItem>
                                            <SelectItem value="64800">
                                                18 hours
                                            </SelectItem>
                                            <SelectItem value="86400">
                                                24 hours
                                            </SelectItem>
                                            <SelectItem value="172800">
                                                48 hours
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        Unsubscribe
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            (notifyChannel !== "none" && !isValid)
                        }
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
