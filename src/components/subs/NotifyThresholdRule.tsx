'use client';

import { useFormContext } from "react-hook-form";
import { FormField, FormControl, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface NotifyThresholdRuleProps {
    enabledName: "threshold_kwh_enabled" | "within_hours_enabled";
    valueName: "threshold_kwh" | "within_hours";
    labelKey: string;
    descriptionKey: string;
    placeholder: string;
    unit: string;
}

export function NotifyThresholdRule({ enabledName, valueName, labelKey, descriptionKey, placeholder, unit }: NotifyThresholdRuleProps) {
    const { t } = useTranslation();
    const { control, watch } = useFormContext();
    const isEnabled = watch(enabledName);

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name={enabledName}
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">{t(labelKey)}</FormLabel>
                            <FormDescription>{t(descriptionKey)}</FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <AnimatePresence>
                {isEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden px-4"
                    >
                        <FormField
                            control={control}
                            name={valueName}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={placeholder}
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? undefined
                                                            : parseFloat(e.target.value)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                                            {unit}
                                        </div>
                                    </div>
                                    <FormMessage className="pt-1" />
                                </FormItem>
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
