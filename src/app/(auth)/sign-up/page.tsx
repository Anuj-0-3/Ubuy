"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/schemas/SignUpSchema";
import { FcGoogle } from "react-icons/fc";
import { Lock, Mail, User } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { signIn } from "next-auth/react";

const Page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
          setUsernameMessage(response.data.message);
        } catch (error: unknown) {
          setUsernameMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  interface FormData {
    username: string;
    email: string;
    password: string;
  }

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/sign-up", data);
      toast.success("Account created successfully");
      router.replace(`/verify/${data.username}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="flex justify-center  items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border-2 border-emerald-500/40 shadow-lg rounded-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Join U-Buy</h1>
          <p className="text-gray-600 mt-2 mb-4">Create an account to start your auction adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input placeholder="Username" className="pl-10" {...field} onChange={(e) => { field.onChange(e); debounced(e.target.value); }} />
                    </div>
                  </FormControl>
                  {isCheckingUsername && <p className="text-sm text-gray-500">Checking availability...</p>}
                  <p className={`text-sm ${usernameMessage.includes("available") ? "text-green-600" : "text-red-600"}`}>{usernameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input placeholder="Email" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input type="password" placeholder="Password" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 hover:cursor-pointer bg-emerald-500 text-white rounded-full shadow-md hover:bg-emerald-600 transition-transform transform hover:scale-105">
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>


        

        <div className="text-center text-gray-500 my-4">OR</div>
        <Button
          type="button"
          onClick={() => signIn("google")}
          className="w-full flex items-center hover:cursor-pointer justify-center gap-2 py-2 px-4 bg-white text-gray-900 border border-gray-300 rounded-full shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105"
        >
          <FcGoogle size={24} /> Sign up with Google
        </Button>
        

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account? <Link href="/sign-in" className="text-emerald-500 hover:cursor-pointer hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;


