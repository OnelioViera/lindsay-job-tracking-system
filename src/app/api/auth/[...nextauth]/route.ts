import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { loginSchema } from '@/lib/validations/user';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('Missing credentials');
        }

        try {
          // Validate input
          const validatedCredentials = loginSchema.parse(credentials);

          // Connect to database
          await dbConnect();

          // Find user by email
          const user = await User.findOne({ email: validatedCredentials.email });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('This user account is disabled');
          }

          // Compare passwords
          const isPasswordCorrect = await user.comparePassword(validatedCredentials.password);

          if (!isPasswordCorrect) {
            throw new Error('Invalid email or password');
          }

          // Return user object for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Set user info on initial login
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }
      // Ensure token always has the role (for subsequent requests)
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

