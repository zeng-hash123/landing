/**
 * URL validation and SSRF defense module.
 */

function isPrivateIp(hostname: string): boolean {
  // Direct IP matching
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '169.254.169.254'
  ) {
    return true;
  }

  // Check IPv4 pattern
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Pattern);

  if (match) {
    const [, octet1, octet2] = match.map(Number);

    // 10.0.0.0/8
    if (octet1 === 10) return true;

    // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;

    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) return true;

    // 169.254.0.0/16 (Link-local)
    if (octet1 === 169 && octet2 === 254) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;

    // 127.0.0.0/8 (Loopback)
    if (octet1 === 127) return true;

    // 0.0.0.0/8
    if (octet1 === 0) return true;
  }

  return false;
}

function isInternalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  const internalSuffixes = [
    '.local',
    '.internal',
    '.lan',
    '.home',
    '.corp',
    '.router',
    '.invalid',
    '.localhost',
    '.test',
  ];

  if (internalSuffixes.some((suffix) => normalized.endsWith(suffix))) {
    return true;
  }

  const blockedHostnames = [
    'metadata.google.internal',
    'metadata',
    'kubernetes.default',
    'instance-data',
  ];

  if (blockedHostnames.includes(normalized)) {
    return true;
  }

  return false;
}

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

export function validateTargetUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required.' };
  }

  let formatted = rawUrl.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);

    // Protocol check
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
    }

    const hostname = parsed.hostname;

    // Hostname check
    if (!hostname || hostname.length === 0) {
      return { isValid: false, error: 'Invalid domain name in URL.' };
    }

    // SSRF & Private IP check
    if (isPrivateIp(hostname)) {
      return { isValid: false, error: 'Access to localhost and private networks is restricted.' };
    }

    // Internal hostname check
    if (isInternalHostname(hostname)) {
      return { isValid: false, error: 'Access to internal network hostnames is restricted.' };
    }

    return {
      isValid: true,
      normalizedUrl: parsed.toString(),
    };
  } catch {
    return { isValid: false, error: 'Invalid URL format. Please enter a valid URL (e.g. https://example.com).' };
  }
}
