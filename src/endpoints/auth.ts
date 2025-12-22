import { BaseService } from "./base.js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface TokenAbility {
  action: string;
  subject: string;
}

export interface CreateTokenParams {
  name: string;
  abilities?: string[] | TokenAbility[];
  expires_at?: string;
}

export interface Token {
  id: string;
  name: string;
  token?: string; // Only present on creation
  abilities: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export class AuthService extends BaseService {
  async login(credentials: LoginCredentials, options?: RequestInit): Promise<{ token: string; user: User }> {
    const response = await this.client.post<{ token: string; user: User }>("/login", credentials, options);
    return response;
  }

  async logout(options?: RequestInit): Promise<void> {
    await this.client.post("/logout", {}, options);
  }

  async getUser(options?: RequestInit): Promise<User> {
    const response = await this.client.get<User>("/user", options);
    return response;
  }

  async createToken(params: CreateTokenParams, options?: RequestInit): Promise<Token> {
    const response = await this.client.post<Token>("/tokens", params, options);
    return response;
  }

  async getTokens(options?: RequestInit): Promise<Token[]> {
    const response = await this.client.get<Token[]>("/tokens", options);
    return response;
  }

  async revokeToken(tokenId: string, options?: RequestInit): Promise<void> {
    await this.client.delete(`/tokens`, {
      ...options,
      body: JSON.stringify({ token_id: tokenId }),
    });
  }
}
