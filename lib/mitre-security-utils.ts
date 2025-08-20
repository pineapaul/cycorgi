/**
 * MITRE ATTACK API Security Utilities
 * 
 * Additional security functions and helpers for the MITRE ATTACK API integration.
 */

import { getEnvironmentConfig } from './mitre-security-config'

/**
 * Rate limiting implementation for MITRE API requests
 */
class RateLimiter {
  private requests: number[] = []
  private readonly config = getEnvironmentConfig()

  isAllowed(): boolean {
    const now = Date.now()
    const windowStart = now - this.config.rateLimit.windowMs
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(timestamp => timestamp > windowStart)
    
    // Check if we're under the limit
    if (this.requests.length < this.config.rateLimit.maxRequestsPerMinute) {
      this.requests.push(now)
      return true
    }
    
    return false
  }

  getRemainingRequests(): number {
    const now = Date.now()
    const windowStart = now - this.config.rateLimit.windowMs
    this.requests = this.requests.filter(timestamp => timestamp > windowStart)
    return Math.max(0, this.config.rateLimit.maxRequestsPerMinute - this.requests.length)
  }
}

// Global rate limiter instance (lazy-loaded)
let _mitreRateLimiter: RateLimiter | null = null

function getMitreRateLimiter(): RateLimiter {
  if (!_mitreRateLimiter) {
    _mitreRateLimiter = new RateLimiter()
  }
  return _mitreRateLimiter
}

export const mitreRateLimiter = getMitreRateLimiter()

/**
 * Validate and sanitize STIX object data
 */
export function validateStixObject(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false
  }
  
  // Check for required properties
  if (!obj.type || !obj.id || typeof obj.type !== 'string' || typeof obj.id !== 'string') {
    return false
  }
  
  // Validate type is expected
  if (obj.type !== 'attack-pattern') {
    return false
  }
  
  // Check for potentially malicious content
  if (obj.name && typeof obj.name === 'string') {
    // Check for script injection attempts
    if (obj.name.includes('<script') || obj.name.includes('javascript:')) {
      return false
    }
  }
  
  if (obj.description && typeof obj.description === 'string') {
    // Check for script injection attempts
    if (obj.description.includes('<script') || obj.description.includes('javascript:')) {
      return false
    }
  }
  
  return true
}

/**
 * Sanitize string content to prevent XSS
 */
export function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove potentially dangerous HTML/script content
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }
  
  return sanitized
}

/**
 * Validate MITRE technique ID format
 */
export function validateMitreId(id: string): boolean {
  if (typeof id !== 'string') {
    return false
  }
  
  const config = getEnvironmentConfig()
  return config.patterns.mitreTechniqueId.test(id)
}

/**
 * Create a secure fetch request with timeout and validation
 */
export async function secureFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const config = getEnvironmentConfig()
  
  // Check rate limiting
  if (!mitreRateLimiter.isAllowed()) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }
  
  // Set up timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.request.timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...config.request.headers,
        ...options.headers
      }
    })
    
    clearTimeout(timeoutId)
    
    // Validate response
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // Validate content type
    const contentType = response.headers.get('content-type')
    
    // Special handling for GitHub raw content (which returns text/plain for JSON files)
    const isGitHubRawContent = url.includes('raw.githubusercontent.com')
    const allowedTypes = isGitHubRawContent 
      ? config.patterns.githubRawContentTypes 
      : config.patterns.allowedContentTypes
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      throw new Error(`Invalid content type received: ${contentType} for URL: ${url}`)
    }
    
    // Check response size
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > config.validation.maxResponseSize) {
      throw new Error('Response size exceeds maximum allowed')
    }
    
    return response
    
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(event: string, details: Record<string, any> = {}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    source: 'MITRE-ATTACK-API'
  }
  
  // In production, send to security monitoring system
  if (process.env.NODE_ENV === 'production') {
    console.warn('SECURITY EVENT:', logEntry)
    // TODO: Send to security monitoring service
  } else {
    console.log('SECURITY EVENT:', logEntry)
  }
}
