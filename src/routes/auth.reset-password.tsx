import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/services/api";
import { resetPassword } from "@/stores/auth";

const searchSchema = z.object({
  token: z.string().optional(),
  email: z.string().optional(),
});

const schema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/auth/reset-password")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Choose a new password — WA Platform" },
      { name: "description", content: "Set a new password for your WA Platform account." },
      { property: "og:title", content: "Choose a new password — WA Platform" },
      { property: "og:description", content: "Set a new password for your WA Platform account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: search.email ?? "", password: "", password_confirmation: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await resetPassword({ token: search.token ?? "", email: values.email, password: values.password });
      toast.success("Password updated. You can sign in now.");
      navigate({ to: "/auth/login", replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not update your password. Please try again.");
    }
  }

  const errors = form.formState.errors;

  return (
    <AuthLayout
      title="Choose a new password"
      description="Pick something you haven't used before."
      footer={
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm new password</Label>
          <Input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            {...form.register("password_confirmation")}
          />
          {errors.password_confirmation ? (
            <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
