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
      try {
        // Only run this in runtime environment and if MongoDB URI is available
        if (typeof window === 'undefined' && process.env.MONGODB_URI) {
          // Dynamic import to avoid build-time issues
          const { MongoClient } = await import('mongodb')
          
          // Set default role when a new user is created
          const client = new MongoClient(process.env.MONGODB_URI)
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
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
    }
  }
}

// Add MongoDB adapter if available (runtime only)
if (typeof window === 'undefined') {
  try {
    // Dynamic import to avoid build-time issues
    import('@auth/mongodb-adapter').then(async ({ MongoDBAdapter }) => {
      import('./mongodb').then(async ({ default: getClientPromise }) => {
        authOptions.adapter = MongoDBAdapter(getClientPromise())
      }).catch(() => {
        console.warn('MongoDB client not available during build')
      })
    }).catch(() => {
      console.warn('MongoDB adapter not available during build')
    })
  } catch (error) {
    console.warn('Error setting up MongoDB adapter:', error)
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
