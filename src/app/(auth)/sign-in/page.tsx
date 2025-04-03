"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/SignInSchema";
import { FcGoogle } from "react-icons/fc";
import { Lock, Mail } from "lucide-react";

const Page = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      toast.error("Invalid credentials");
    }
    if (result?.url) {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex justify-center  items-center min-h-screen bg-gray-50">
      {/* Glassmorphism Container */}
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-3xl border-2 border-emerald-500/40 shadow-lg rounded-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to access your account</p>
        </div>

        {/* Sign-In Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Email/Username */}
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email/Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input placeholder="Enter your email/username" className="pl-10 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input type="password" placeholder="Enter your password" className="pl-10 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sign-In Button */}
            <Button type="submit" className="w-full py-2 px-4 bg-emerald-500 text-white rounded-full shadow-md hover:bg-emerald-600 transition-transform transform hover:scale-105">
              Sign In
            </Button>

            {/* Google Sign-In */}
            <Button
              type="button"
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white text-gray-900 border border-gray-300 rounded-full shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
              <FcGoogle size={24} /> Sign in with Google
            </Button>
          </form>
        </Form>

        {/* Sign-Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            New user?{" "}
            <Link href="/sign-up" className="text-emerald-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;


