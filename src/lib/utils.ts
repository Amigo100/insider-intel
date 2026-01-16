import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * User object type for display name extraction
 */
interface UserForDisplayName {
  name?: string | null
  email?: string | null
}

/**
 * Gets a user-friendly display name from user data.
 *
 * Priority:
 * 1. Use profile display name (user.name) if it exists and looks like a real name
 * 2. Smart-parse email username (remove numbers, split camelCase/separators)
 * 3. Fall back to generic greeting
 *
 * @param user - User object with optional name and email
 * @param fallback - Fallback text if no name can be derived (default: 'there')
 * @returns First name or parsed username for display
 */
export function getDisplayName(
  user: UserForDisplayName | null | undefined,
  fallback: string = 'there'
): string {
  if (!user) return fallback

  // Priority 1: Use display name if it exists and has spaces (real name)
  if (user.name && user.name.trim()) {
    const trimmedName = user.name.trim()

    // If name has spaces, it's likely a real name - use first part
    if (trimmedName.includes(' ')) {
      const firstName = trimmedName.split(/\s+/)[0]
      return capitalizeFirst(firstName)
    }

    // If name looks like a parsed name (not an email-derived one), use it
    // Check if it's NOT all lowercase or doesn't look like an email username
    if (!/^[a-z0-9._-]+$/.test(trimmedName)) {
      return capitalizeFirst(trimmedName)
    }
  }

  // Priority 2: Smart-parse email username
  if (user.email) {
    const parsed = parseEmailUsername(user.email)
    if (parsed) return parsed
  }

  // Priority 3: If we have a name but couldn't use it above, try parsing it
  if (user.name && user.name.trim()) {
    const parsed = parseUsername(user.name.trim())
    if (parsed) return parsed
  }

  return fallback
}

/**
 * Parse an email address to extract a friendly first name
 */
function parseEmailUsername(email: string): string | null {
  const username = email.split('@')[0]
  return parseUsername(username)
}

/**
 * Parse a username string into a friendly display name
 * Handles: alex.deighton, alexDeighton, alex_deighton, alex-deighton, alex123
 */
function parseUsername(username: string): string | null {
  if (!username) return null

  // Remove trailing numbers (e.g., "alex123" -> "alex")
  let cleaned = username.replace(/\d+$/, '')
  if (!cleaned) cleaned = username // Keep original if all numbers

  // Split on common separators (., _, -)
  let parts = cleaned.split(/[._-]+/)

  // If no separators, try splitting camelCase (alexDeighton -> alex, Deighton)
  if (parts.length === 1 && parts[0]) {
    parts = splitCamelCase(parts[0])
  }

  // Get first meaningful part
  const firstName = parts[0]
  if (!firstName || firstName.length < 2) return null

  // Avoid returning something that looks too weird
  if (!/^[a-zA-Z]+$/.test(firstName)) return null

  return capitalizeFirst(firstName)
}

/**
 * Split a camelCase or PascalCase string into parts
 * "alexDeighton" -> ["alex", "Deighton"]
 * "AlexDeighton" -> ["Alex", "Deighton"]
 */
function splitCamelCase(str: string): string[] {
  // Insert space before uppercase letters, then split
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
