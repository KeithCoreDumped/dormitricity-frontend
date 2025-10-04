'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export function AddSubCard({ onSubAdded }: { onSubAdded: () => void }) {
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [canonicalId, setCanonicalId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleAdd() {
        if (!canonicalId) {
            alert(t('add_sub.error_enter_id'));
            return;
        }
        setIsLoading(true);
        try {
            await apiClient.post('/subs', { canonical_id: canonicalId });
            alert(t('add_sub.success'));
            setIsAdding(false);
            setCanonicalId('');
            onSubAdded();
        } catch (err: unknown) {
            const error = err as Error & { response?: { data?: { error?: string } } };
            const errorMsg = error.response?.data?.error || error.message || t('unknown_error');
            alert(t('add_sub.error_failed', { errorMsg }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full min-h-[280px]"
        >
            <AnimatePresence mode="wait">
                {!isAdding ? (
                    <motion.div
                        key="add-button"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        <Card
                            className="flex items-center justify-center h-full border-2 border-dashed hover:border-primary transition-colors cursor-pointer bg-muted/20 hover:bg-muted/50"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="h-16 w-16 text-muted-foreground" />
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="add-form"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>{t('add_sub.new_subscription_title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-center">
                                <Input
                                    placeholder={t('add_sub.placeholder')}
                                    value={canonicalId}
                                    onChange={(e) => setCanonicalId(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                                <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={isLoading}>
                                    {t('add_sub.cancel_button')}
                                </Button>
                                <Button onClick={handleAdd} disabled={isLoading}>
                                    {isLoading ? t('add_sub.adding_button') : t('add_sub.add_button')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
