"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signUpSchema } from "@/schemas/SignUpSchema"
import { FcGoogle } from "react-icons/fc"
import { Lock, Mail, User } from "lucide-react"
import axios from "axios"
import { useState, useEffect } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { signIn } from "next-auth/react"


const page = () => {
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounced = useDebounceCallback(setUsername, 500)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true)
        setUsernameMessage('')
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          setUsernameMessage("An error occurred")
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [username])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await axios.post('/api/sign-up', data)
      toast.success('Account created successfully')
      router.replace(`/dashboard`)
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-2xl shadow-black">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join U-Buy</h1>
          <p className="mb-4">Create an account to start your auction adventure</p>
        </div>
        <Button
          type="button"
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white text-black border rounded-md shadow hover:bg-gray-100"
        >
          <FcGoogle size={24} /> Sign up with Google
        </Button>

        <div className="text-center text-gray-500 my-2">OR</div>
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
                      <User className="absolute left-3 top-3 text-gray-400" size={20} />
                      <Input placeholder="Username" className="pl-10" {...field} onChange={(e) => { field.onChange(e); debounced(e.target.value); }} />
                    </div>
                  </FormControl>
                  {isCheckingUsername && <p className="text-sm text-gray-500">Checking availability...</p>}
                  <p className={`text-sm ${usernameMessage.includes('available') ? 'text-green-600' : 'text-red-600'}`}>{usernameMessage}</p>
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
            <Button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>Already have an account? <Link href="/sign-in" className="text-blue-600 hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}

export default page


