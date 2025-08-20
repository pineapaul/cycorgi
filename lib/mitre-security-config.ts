/**
 * MITRE ATTACK API Security Configuration
 * 
 * This file contains security-related configuration for the MITRE ATTACK API integration.
 * All security settings are centralised here for easy management and auditing.
 */

export const MITRE_SECURITY_CONFIG = {
  // API endpoints - Official MITRE ATTACK STIX data feeds
  endpoints: {
    primary: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
    fallback: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
    // These are the official, verified MITRE STIX feed URLs from their GitHub repository
  },
  
  // Request security settings
  request: {
    timeout: 10000, // 10 seconds
    maxRetries: 2,
    userAgent: 'Cycorgi-Threat-Library/1.0',
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'max-age=3600'
    }
  },
  
  // Response validation limits
  validation: {
    maxResponseSize: 50 * 1024 * 1024, // 50MB (STIX feeds can be large)
    maxObjects: 10000,
    maxTechniques: 1000,
    maxNameLength: 200,
    maxDescriptionLength: 2000,
    maxPlatformsPerTechnique: 20,
    maxPlatformNameLength: 50,
    maxIdLength: 100
  },
  
  // Caching configuration
  cache: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    gracePeriod: 48 * 60 * 60 * 1000, // 48 hours (use expired cache if API fails)
    enableMemoryCache: true,
    // In production, consider Redis or similar for distributed caching
  },
  
  // Content validation patterns
  patterns: {
    mitreTechniqueId: /^T\d{4}(\.\d{3})?$/,
    allowedContentTypes: ['application/json', 'application/vnd.api+json', 'text/plain', 'text/json'],
    // GitHub raw content returns text/plain for JSON files, which is normal and secure
    githubRawContentTypes: ['text/plain', 'text/json', 'application/json']
  },
  
  // Security headers to validate
  requiredHeaders: ['content-type'],
  
  // Rate limiting (basic implementation)
  rateLimit: {
    maxRequestsPerMinute: 60,
    windowMs: 60 * 1000
  }
} as const

// Type-safe access to configuration
export type MitreSecurityConfig = typeof MITRE_SECURITY_CONFIG

// Helper function to get configuration value
export function getMitreConfig<K extends keyof MitreSecurityConfig>(
  key: K
): MitreSecurityConfig[K] {
  return MITRE_SECURITY_CONFIG[key]
}

// Environment-specific overrides
export function getEnvironmentConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    ...MITRE_SECURITY_CONFIG,
    cache: {
      ...MITRE_SECURITY_CONFIG.cache,
      duration: isProduction 
        ? MITRE_SECURITY_CONFIG.cache.duration 
        : 5 * 60 * 1000, // 5 minutes in development
      enableMemoryCache: !isProduction // Disable in production for distributed systems
    },
    request: {
      ...MITRE_SECURITY_CONFIG.request,
      timeout: isProduction ? 15000 : 5000 // Longer timeout in production
    }
  }
}
