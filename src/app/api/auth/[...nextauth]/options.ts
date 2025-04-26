import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
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
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //@ts-expect-error : Ignoring type error here 
      async authorize(credentials) {
        // Ensuring dbConnect is called to connect to MongoDB
        await dbConnect();

        if (!credentials || !credentials.identifier || !credentials.password) {
          throw new Error('Missing credentials');
        }

        try {
          const user = await User.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error('No user found with this email/username');
          }

          // Check if the user is verified
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }

          // Compare password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            // If password matches, return user object
            return {
              _id: user.id.toString(),
              username: user.username,
              email: user.email,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages,
            };
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err) {
          if (err instanceof Error) {
            throw new Error(err.message || 'An error occurred during authentication');
          } else {
            // Fallback in case the error doesn't have the expected shape
            throw new Error('An unknown error occurred during authentication');
        }
      }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
  
      if (account?.provider === 'google') {
        let existingUser = await AuthUser.findOne({ email: user.email });
  
        if (!existingUser) {
          existingUser = await AuthUser.create({
            email: user.email,
            name: user.name,
            provider: 'google',
          });
        }
  
        // Attach id to user object for jwt callback
        user.id = existingUser._id.toString();
        user.username = existingUser.name;
      }
  
      return true;
      
    },
  
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
  
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  
    async redirect({ baseUrl }) {
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
