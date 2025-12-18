import bcrypt from "bcrypt";
import { getUserByUsernameOrEmail, type User } from "./sqlite-db";

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export function validateCredentials(
  usernameOrEmail: string,
  password: string
): LoginResponse {
  if (!usernameOrEmail || !password) {
    return {
      success: false,
      message: "Username/Email and password are required",
    };
  }

  const user = getUserByUsernameOrEmail(usernameOrEmail);

  if (!user) {
    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid credentials",
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}
