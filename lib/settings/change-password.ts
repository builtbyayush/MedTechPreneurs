import { compare, hash } from "bcryptjs";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const BCRYPT_ROUNDS = 12;

export class ChangePasswordError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ChangePasswordError";
    this.status = status;
  }
}

export async function changePasswordForUser(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
  },
): Promise<void> {
  await connectDB();

  const user = await User.findById(userId).select("+passwordHash").lean<{
    passwordHash?: string;
  } | null>();

  if (!user?.passwordHash) {
    throw new ChangePasswordError("Account not found.", 404);
  }

  const currentMatches = await compare(input.currentPassword, user.passwordHash);

  if (!currentMatches) {
    throw new ChangePasswordError("Current password is incorrect.", 401);
  }

  const passwordHash = await hash(input.newPassword, BCRYPT_ROUNDS);

  await User.findByIdAndUpdate(userId, { passwordHash });
}
