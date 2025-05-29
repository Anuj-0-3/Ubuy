"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import axios from "axios";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Key } from "lucide-react";

const emailSchema = z.object({ email: z.string().email() });
const codeSchema = z.object({ code: z.string().length(6, "Code must be 6 digits") });

export default function ForgotPasswordPage() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const handleSendCode = async (values: z.infer<typeof emailSchema>) => {
    try {
      await axios.post("/api/forgot-password", { email: values.email });
      toast.success("Reset code sent");
      setEmail(values.email);
      setIsCodeSent(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to send reset code");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleVerifyCode = async (values: z.infer<typeof codeSchema>) => {
    try {
      const res = await axios.post("/api/reset-code", {
        email,
        code: values.code,
      });
      toast.success("Code verified");
      router.push(`/reset-password/${res.data.username}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Invalid code");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-3xl border-2 border-emerald-500/40 shadow-lg rounded-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-1">
            {!isCodeSent ? "We'll send a code to your email" : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {!isCodeSent ? (
          <FormProvider {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-6">
              <FormField
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <Input {...field} placeholder="Enter your email" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full hover:cursor-pointer">Send Reset Code</Button>
            </form>
          </FormProvider>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-2">
              Code sent to: <span className="font-semibold">{email}</span>
            </p>
            <FormProvider {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-6">
                <FormField
                  name="code"
                  control={codeForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter Verification Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                          <Input {...field} placeholder="6-digit code" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Verify Code</Button>
              </form>
            </FormProvider>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsCodeSent(false)}
                className="text-sm text-emerald-600 hover:underline"
              >
                Change email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

