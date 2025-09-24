'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

export function AddSubCard({ onSubAdded }: { onSubAdded: () => void }) {
    const [isAdding, setIsAdding] = useState(false);
    const [canonicalId, setCanonicalId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleAdd() {
        if (!canonicalId) {
            toast.error('Please enter a dormitory ID.');
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Adding subscription...');
        try {
            await apiClient.post('/subs', { canonical_id: canonicalId });
            toast.success('Subscription added!', { id: toastId });
            setIsAdding(false);
            setCanonicalId('');
            onSubAdded();
        } catch (err: unknown) {
            const error = err as Error & { response?: { data?: { error?: string } } };
            const errorMsg = error.response?.data?.error || error.message || 'An unknown error occurred';
            toast.error(`Failed to add: ${errorMsg}`, { id: toastId });
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
                <CardTitle>New Subscription</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center">
                <Input
                    placeholder="e.g., 5-202, E-505"
                    value={canonicalId}
                    onChange={(e) => setCanonicalId(e.target.value)}
                    disabled={isLoading}
                />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add'}
                </Button>
            </CardFooter>
        </Card>
    );
}
