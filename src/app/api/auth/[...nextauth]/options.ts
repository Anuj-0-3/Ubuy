import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import AuthUser from '@/models/AuthUser';


export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        id: 'credentials',
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'text',placeholder: "user@example.com" },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: any): Promise<any> {
          await dbConnect();
          try {
            const user = await User.findOne({
              $or: [
                { email: credentials.identifier },
                { username: credentials.identifier },
              ],
            });
            if (!user) {
              throw new Error('No user found with this email');
            }
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              return user;
            } else {
              throw new Error('Incorrect password');
            }
          } catch (err: any) {
            throw new Error(err);
          }
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
      }),
    ],
    callbacks: {
      async signIn({ user, account }) {
        await dbConnect();
  
        if (account?.provider === 'google') {
          const existingUser = await AuthUser.findOne({ email: user.email });
  
          if (!existingUser) {
            await AuthUser.create({        
              email: user.email,              
              name: user.name,                        
              provider: 'google', 
            });
          }
        }
  
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          token._id = user._id?.toString(); 
          token.username = user.username;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user._id = token._id;
          session.user.username = token.username;
        }
        return session;
      },
      async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
        return baseUrl; 
      },
    },
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: '/sign-in',
    },
  };