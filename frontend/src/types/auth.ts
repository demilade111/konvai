export interface User {
  id: string
  email: string
  role: 'admin' | 'agent'
  org_id: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RegisterPayload {
  org_name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}
