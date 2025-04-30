"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserCheck, ShieldCheck } from "lucide-react";

const verifySchema = z.object({
  username: z.string().min(1, "Username is required"),
  code: z.string().length(6, "Code must be 6 digits"),
});

const VerifyCodePage = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      username: "",
      code: "",
    },
  });

  const onSubmit = async (values: { username: string; code: string }) => {
    try {
      await axios.post("/api/verify-code", values);
      toast.success("Verification successful! You can now log in.");
      router.replace("/sign-in");
    } catch  {
      toast.error("Verification failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border-2 border-emerald-500/40 shadow-lg rounded-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Account</h1>
          <p className="text-gray-600">Enter the code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input placeholder="Your username" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input placeholder="6-digit code" className="pl-10" maxLength={6} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-emerald-500 text-white rounded-full shadow-md hover:bg-emerald-600">
              Verify Account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyCodePage;
