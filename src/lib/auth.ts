import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { compare } from "bcryptjs";
import type { Document, WithId } from "mongodb";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { getMongoClientPromise } from "@/lib/mongodb";

type DbUser = WithId<Document> & {
  email: string;
  emailLower: string;
  name?: string;
  image?: string;
  passwordHash?: string;
  authProviders?: string[];
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const emailLower = parsed.data.email.trim().toLowerCase();
      const password = parsed.data.password;
      const client = await getMongoClientPromise();
      const db = client.db();
      const users = db.collection<DbUser>("users");
      const user = await users.findOne({ emailLower });

      if (!user?.passwordHash) {
        return null;
      }

      const passwordValid = await compare(password, user.passwordHash);
      if (!passwordValid) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name ?? user.email,
        image: typeof user.image === "string" ? user.image : null,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getMongoClientPromise()),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      if (account?.provider && account.provider !== "credentials") {
        const client = await getMongoClientPromise();
        const db = client.db();
        const users = db.collection("users");
        const emailLower = user.email.toLowerCase();

        await users.updateOne(
          { emailLower },
          {
            $setOnInsert: {
              email: user.email,
              emailLower,
              createdAt: new Date(),
            },
            $set: {
              name: user.name ?? null,
              image: user.image ?? null,
              updatedAt: new Date(),
            },
            $addToSet: {
              authProviders: account.provider,
            },
          },
          { upsert: true }
        );
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
