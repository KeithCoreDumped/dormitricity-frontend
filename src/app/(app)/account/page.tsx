'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { jwtDecode } from "jwt-decode";
import { getToken } from "@/lib/auth";

interface DecodedToken {
  email: string;
  exp: number;
  iat: number;
}

const formSchema = z.object({
  email: z.string().email(),
});

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const token = getToken();
  const userEmail = token ? (jwtDecode(token) as DecodedToken).email : "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.email !== userEmail) {
      form.setError("email", { message: "Email does not match" });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/delete", { email: values.email });
      removeToken();
      router.push("/login");
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Account Management</h1>
      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={userEmail} readOnly />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Please type your email to confirm.</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isLoading}>
                  {isLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}