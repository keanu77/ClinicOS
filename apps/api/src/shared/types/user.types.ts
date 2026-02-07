import { Role } from "../enums/role.enum";
import { Position } from "../enums/position.enum";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  position: Position;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, "passwordHash"> {}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: Role;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  position: Position;
  iat?: number;
  exp?: number;
}
