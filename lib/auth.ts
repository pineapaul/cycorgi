import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { USER_ROLES, USER_STATUS } from "./constants"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
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
      
      // Handle provider-specific logic if needed in the future
      if (account) {
        // You can add provider-specific logic here later
        // For example: token.provider = account.provider
      }
      
      return token
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      try {
        // Only run this on the server side where MongoDB is accessible
        if (typeof window === 'undefined' && process.env.MONGODB_URI) {
          const { MongoClient } = await import('mongodb')
          
          const client = new MongoClient(process.env.MONGODB_URI)
          await client.connect()
          const db = client.db()
          
          // Set default role and status for new users
          await db.collection('users').updateOne(
            { email: user.email },
            {
              $set: {
                role: USER_ROLES.VIEWER,
                status: USER_STATUS.PENDING,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          )
          
          await client.close()
        }
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
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
