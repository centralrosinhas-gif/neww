import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { username: string }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}
