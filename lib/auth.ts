import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import getClientPromise from "./mongodb"
import { MongoClient } from "mongodb"
import { USER_ROLES, USER_STATUS } from "./constants"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getClientPromise()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Custom logic for handling new user registration
      // This will be called every time someone signs in
      return true
    },
    async session({ session, token }) {
      // Add user ID and role to the session from the JWT token
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string || USER_ROLES.VIEWER
        session.user.status = token.status as string || USER_STATUS.PENDING
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Add user info to JWT token
      if (user) {
        token.id = user.id
        token.role = (user as any).role || USER_ROLES.VIEWER
        token.status = (user as any).status || USER_STATUS.PENDING
      }
      return token
    }
  },
  session: {
    strategy: "jwt", // Use JWT sessions for better compatibility
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      // Set default role when a new user is created
      const client = new MongoClient(process.env.MONGODB_URI!)
      await client.connect()
      const db = client.db()
      
      await db.collection('users').updateOne(
        { email: user.email },
        {
          $set: {
            role: USER_ROLES.VIEWER, // Default role for new users
            status: USER_STATUS.PENDING, // Require admin approval
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      )
      
      await client.close()
    }
  }
}

// Type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      status: string
    }
  }

  interface User {
    role?: string
    status?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    status?: string
  }
}
