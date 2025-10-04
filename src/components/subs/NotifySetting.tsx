'use client';

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
import { NotifyChannel, Subscription } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useRef, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChannelIcon } from "@/components/subs/ChannelIcon";
import { NotifyThresholdRule } from "./NotifyThresholdRule";
import { motion, AnimatePresence } from "framer-motion";

const getFormSchema = (t: (key: string) => string) =>
    z
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
            (data) => data.notify_channel === "none" || !!data.notify_token,
            { message: t("notify.token_required"), path: ["notify_token"] }
        )
        .refine(
            (data) => {
                if (data.notify_channel === "none" || !data.notify_token) return true;
                const re = {
                    serverchan: /^(SCT[0-9A-Za-z]+)$/,
                    uuid: /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
                };
                if (data.notify_channel === "serverchan") return re.serverchan.test(data.notify_token);
                if (data.notify_channel === "wxwork" || data.notify_channel === "feishu") return re.uuid.test(data.notify_token);
                return false;
            },
            { message: t("notify.token_invalid"), path: ["notify_token"] }
        )
        .refine(
            (data) => !data.threshold_kwh_enabled || (data.threshold_kwh !== undefined && data.threshold_kwh > 0),
            { message: t("notify.positive_number_error"), path: ["threshold_kwh"] }
        )
        .refine(
            (data) => !data.within_hours_enabled || (data.within_hours !== undefined && data.within_hours > 0),
            { message: t("notify.positive_number_error"), path: ["within_hours"] }
        );

type NotifySettingProps = {
    sub: Subscription;
    onSuccess: () => void;
    onSubDeleted: () => void;
};

export function NotifySetting({ sub, onSuccess, onSubDeleted }: NotifySettingProps) {
    const { t } = useTranslation();
    const formSchema = getFormSchema(t);
    const [isTesting, setIsTesting] = useState(false);
    const [testStatus, setTestStatus] = useState<{ ok: boolean; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            notify_channel: sub.notify_channel,
            notify_token: sub.notify_token || "",
            threshold_kwh_enabled: sub.threshold_kwh > 0,
            threshold_kwh: sub.threshold_kwh > 0 ? sub.threshold_kwh : undefined,
            within_hours_enabled: sub.within_hours > 0,
            within_hours: sub.within_hours > 0 ? sub.within_hours : undefined,
            cooldown_sec: sub.cooldown_sec,
        },
    });

    const { watch, setValue, handleSubmit, control, getValues, trigger, formState: { isValid } } = form;
    const notifyChannel = watch("notify_channel");

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        trigger("notify_token");
    }, [notifyChannel, trigger]);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setTestStatus(null);

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

        if (wxworkMatch) { channel = "wxwork"; token = wxworkMatch[1]; }
        else if (feishuMatch) { channel = "feishu"; token = feishuMatch[1]; }
        else if (serverchanUrlMatch) { channel = "serverchan"; token = serverchanUrlMatch[1]; }
        else if (serverchanTokenMatch) { channel = "serverchan"; token = serverchanTokenMatch[0]; }
        else if (uuidMatch) { channel = "wxwork"; token = uuidMatch[0]; }

        if (channel) setValue("notify_channel", channel, { shouldValidate: true });
        setValue("notify_token", token, { shouldValidate: true });
    };

    async function onTest() {
        const { notify_channel, notify_token } = getValues();
        if (!notify_token) {
            setTestStatus({ ok: false, message: t("notify.token_required_for_test") });
            return;
        }

        setIsTesting(true);
        setTestStatus(null);

        try {
            const result = await apiClient.post("/subs/test-notify", { notify_channel, notify_token, canonical_id: sub.canonical_id });
            if (result.ok) {
                setTestStatus({ ok: true, message: t("notify.test_successful") });
            } else {
                throw new Error(result.error || t("notify.test_failed_generic"));
            }
        } catch (err: unknown) {
            setTestStatus({ ok: false, message: (err as Error).message || t("unknown_error") });
        } finally {
            setIsTesting(false);
        }
    }

    async function handleDelete() {
        if (confirm(t("notify.confirm_delete"))) {
            try {
                await apiClient.delete(`/subs/${sub.hashed_dir}`);
                onSubDeleted();
            } catch (err) {
                alert((err as Error).message || t("unknown_error"));
            }
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const dataToSubmit = {
            ...values,
            threshold_kwh: values.threshold_kwh_enabled ? values.threshold_kwh : 0,
            within_hours: values.within_hours_enabled ? values.within_hours : 0,
        };

        setIsSubmitting(true);
        try {
            await apiClient.put(`/subs/${sub.hashed_dir}`, dataToSubmit);
            onSuccess();
        } catch (err) {
            alert((err as Error).message || t("unknown_error"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="notify_channel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("notify.channel_label")}</FormLabel>
                                <Select onValueChange={(value) => { field.onChange(value); setTestStatus(null); }} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("notify.select_channel_placeholder")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["none", "wxwork", "feishu", "serverchan"].map(channel => (
                                            <SelectItem key={channel} value={channel}>
                                                <div className="flex items-center gap-2">
                                                    <ChannelIcon channel={channel} className="w-5 h-5" />
                                                    <span>{t(`notify.${channel}_channel`)}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <AnimatePresence>
                        {notifyChannel !== "none" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="space-y-4 overflow-hidden"
                            >
                                <FormField
                                    control={control}
                                    name="notify_token"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("notify.token_label")}</FormLabel>
                                            <div className="flex items-start space-x-2">
                                                <div className="flex-grow">
                                                    <FormControl>
                                                        <Input
                                                            placeholder={t("notify.token_placeholder")}
                                                            {...field}
                                                            onChange={handleTokenChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="pt-2" />
                                                    {testStatus && !testStatus.ok && (
                                                        <p className="text-sm text-destructive pt-2">
                                                            {t("notify.test_failed", { message: testStatus.message })}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button type="button" onClick={onTest} disabled={isTesting || !watch("notify_token")} variant="outline">
                                                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                                     testStatus?.ok ? <Check className="h-4 w-4 text-green-500" /> : 
                                                     t("notify.test_button")}
                                                </Button>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <NotifyThresholdRule
                                    enabledName="threshold_kwh_enabled"
                                    valueName="threshold_kwh"
                                    labelKey="notify.low_power_threshold_label"
                                    descriptionKey="notify.low_power_threshold_description"
                                    placeholder="e.g., 10"
                                    unit="kWh"
                                />

                                <NotifyThresholdRule
                                    enabledName="within_hours_enabled"
                                    valueName="within_hours"
                                    labelKey="notify.depletion_threshold_label"
                                    descriptionKey="notify.depletion_threshold_description"
                                    placeholder="e.g., 24"
                                    unit={t("notify.hours_unit")}
                                />

                                <FormField
                                    control={control}
                                    name="cooldown_sec"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("notify.cooldown_label")}</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("notify.cooldown_placeholder")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="43200">{t("notify.cooldown_12h")}</SelectItem>
                                                    <SelectItem value="64800">{t("notify.cooldown_18h")}</SelectItem>
                                                    <SelectItem value="86400">{t("notify.cooldown_24h")}</SelectItem>
                                                    <SelectItem value="172800">{t("notify.cooldown_48h")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>{t("notify.cooldown_description")}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        {t("notify.unsubscribe_button")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting || (notifyChannel !== "none" && !isValid)}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("notify.save_button")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
