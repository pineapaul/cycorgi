import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { USER_STATUS } from "./constants"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Only run this on the server side where MongoDB is accessible
        if (typeof window === 'undefined' && process.env.MONGODB_URI) {
          const { MongoClient } = await import('mongodb')
          
          const client = new MongoClient(process.env.MONGODB_URI)
          await client.connect()
          const db = client.db()
          
          // Fetch fresh user data from database
          const dbUser = await db.collection('users').findOne({ email: user.email })
          
                     if (dbUser) {
             // Update the user object with fresh data from database
             user.id = dbUser._id.toString()
             user.roles = dbUser.roles || []
             user.status = dbUser.status || USER_STATUS.PENDING
           } else {
             // Set default values for new users
             user.roles = ['Guest']
             user.status = USER_STATUS.PENDING
           }
          
          await client.close()
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        // Still allow sign in even if database lookup fails
        return true
      }
    },
    async session({ session, token }) {
             // Add user ID and roles to the session from the JWT token
       if (session.user) {
         session.user.id = token.id as string
         session.user.roles = token.roles as string[] || []
         session.user.status = token.status as string || USER_STATUS.PENDING
       }
      return session
    },
    async jwt({ token, user, account, trigger }) {
             // Add user info to JWT token
       if (user) {
         token.id = user.id
         token.roles = (user as any).roles || ['Guest']
         token.status = (user as any).status || USER_STATUS.PENDING
       }
      
      // Handle force refresh trigger
      if (trigger === 'update') {
        try {
          // Only run this on the server side where MongoDB is accessible
          if (typeof window === 'undefined' && process.env.MONGODB_URI) {
            const { MongoClient } = await import('mongodb')
            
            const client = new MongoClient(process.env.MONGODB_URI)
            await client.connect()
            const db = client.db()
            
            // Fetch fresh user data from database using email from token
            const dbUser = await db.collection('users').findOne({ email: token.email })
            
                         if (dbUser) {
               // Update token with fresh data
               token.roles = dbUser.roles || []
               token.status = dbUser.status || USER_STATUS.PENDING
             }
            
            await client.close()
          }
        } catch (error) {
          console.error('Error in JWT update trigger:', error)
        }
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
          
                     // Set default roles and status for new users
           await db.collection('users').updateOne(
             { email: user.email },
             {
               $set: {
                 roles: ['Guest'],
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


