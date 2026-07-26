import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { SESSION_MAX_AGE } from "@/config/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  remember: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export const credentialsProvider = Credentials({
  id: "credentials",
  name: "Email and Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
    remember: { label: "Remember session", type: "text" },
  },
  async authorize(credentials) {
    const parsed = credentialsSchema.safeParse(credentials);
    if (!parsed.success) {
      return null;
    }

    await connectDB();

    const user = await User.findOne({
      email: parsed.data.email.toLowerCase(),
    }).select("+passwordHash");

    if (!user?.passwordHash) {
      return null;
    }

    const valid = await compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      remember: parsed.data.remember,
      sessionMaxAge: parsed.data.remember
        ? SESSION_MAX_AGE.remembered
        : SESSION_MAX_AGE.default,
    };
  },
});
