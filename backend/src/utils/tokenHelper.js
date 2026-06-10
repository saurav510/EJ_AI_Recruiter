const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'ej_recruit_ai_super_secret_key_123456';

/**
 * Signs a payload as an HS256 JWT-compliant token.
 * @param {object} payload - Key-value pairs to store in token payload
 * @param {number} expiresInDays - Token duration in days (default: 7)
 * @returns {string} The signed JWT token string (header.payload.signature)
 */
const signToken = (payload, expiresInDays = 7) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  // Calculate expiration timestamp (in seconds)
  const exp = Math.floor(Date.now() / 1000) + (expiresInDays * 24 * 60 * 60);
  const payloadWithExp = { ...payload, exp };
  
  const payloadBase64 = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadBase64}`)
    .digest('base64url');
    
  return `${header}.${payloadBase64}.${signature}`;
};

/**
 * Verifies and decodes an HS256 JWT-compliant token.
 * @param {string} token - The signed token string
 * @returns {object|null} The decoded payload if valid and not expired, null otherwise
 */
const verifyToken = (token) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    
    // Recompute signature to verify integrity
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    
    // Verify expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return decodedPayload;
  } catch (err) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken
};
