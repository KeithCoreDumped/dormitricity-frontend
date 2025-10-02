'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';

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

    if (!isAdding) {
        return (
            <Card
                className="flex items-center justify-center h-full min-h-[280px] border-2 border-dashed hover:border-primary transition-colors cursor-pointer"
                onClick={() => setIsAdding(true)}
            >
                <Plus className="h-16 w-16 text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="h-full min-h-[280px] flex flex-col">
            <CardHeader>
                <CardTitle>{t('add_sub.new_subscription_title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center">
                <Input
                    placeholder={t('add_sub.placeholder')}
                    value={canonicalId}
                    onChange={(e) => setCanonicalId(e.target.value)}
                    disabled={isLoading}
                />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isLoading}>
                    {t('add_sub.cancel_button')}
                </Button>
                <Button onClick={handleAdd} disabled={isLoading}>
                    {isLoading ? t('add_sub.adding_button') : t('add_sub.add_button')}
                </Button>
            </CardFooter>
        </Card>
    );
}
