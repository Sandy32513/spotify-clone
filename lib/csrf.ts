import crypto from 'crypto';
import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'development-csrf-secret-change-me';

/**
 * Generate a cryptographically secure CSRF token and its signature
 */
export async function generateCsrfToken(): Promise<{ token: string; cookieValue: string }> {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Sign the token to ensure it hasn't been tampered with
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
    
  const cookieValue = `${token}.${signature}`;
  
  return { token, cookieValue };
}

/**
 * Validate a CSRF token provided in a request header/body against the token in the cookie
 */
export async function validateCsrfToken(providedToken: string | null): Promise<boolean> {
  if (!providedToken) return false;
  
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME);
  
  if (!csrfCookie || !csrfCookie.value) return false;
  
  const [cookieToken, signature] = csrfCookie.value.split('.');
  if (!cookieToken || !signature) return false;
  
  // 1. Verify the provided token matches the token in the cookie
  const providedBuffer = Buffer.from(providedToken);
  const cookieBuffer = Buffer.from(cookieToken);
  
  if (providedBuffer.length !== cookieBuffer.length) return false;
  if (!crypto.timingSafeEqual(providedBuffer, cookieBuffer)) return false;
  
  // 2. Verify the cookie signature is valid (prevents cookie forging)
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(cookieToken)
    .digest('hex');
    
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  
  if (signatureBuffer.length !== expectedSignatureBuffer.length) return false;
  
  return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}
