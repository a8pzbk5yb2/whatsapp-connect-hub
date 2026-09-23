import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/services/api";
import { getSession, hydrateSession, isSuperAdmin, register as registerAccount } from "@/stores/auth";

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    company_name: z.string().min(2, "Enter your company name"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(6, "Enter a valid phone number"),
    password: z.string().min(8, "Use at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/auth/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your account — WA Platform" },
      { name: "description", content: "Create a WhatsApp Business workspace for your company in minutes." },
      { property: "og:title", content: "Create your account — WA Platform" },
      { property: "og:description", content: "Create a WhatsApp Business workspace for your company in minutes." },
    ],
  }),
  beforeLoad: () => {
    hydrateSession();
    if (getSession()) throw redirect({ to: isSuperAdmin() ? "/admin" : "/dashboard" });
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", company_name: "", email: "", phone: "", password: "", password_confirmation: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        phone: values.phone,
        company_name: values.company_name,
        password: values.password,
      });
      toast.success("Account created. Please confirm your email address.");
      navigate({ to: "/auth/verify-email", replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We could not create your account. Please try again.");
    }
  }

  const errors = form.formState.errors;

  return (
    <AuthLayout
      title="Create your account"
      description="Set up your company workspace, then connect WhatsApp."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company name</Label>
          <Input id="company_name" autoComplete="organization" {...form.register("company_name")} />
          {errors.company_name ? <p className="text-xs text-destructive">{errors.company_name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" autoComplete="tel" placeholder="+91 99999 99999" {...form.register("phone")} />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm password</Label>
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
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
