'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string
  met: boolean
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: Requirement[] = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
  ], [password])

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length
    if (metCount === 0) return { level: 0, label: '', color: '' }
    if (metCount === 1) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (metCount === 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' }
    if (metCount === 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' }
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' }
  }, [requirements])

  if (!password) return null

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                level <= strength.level ? strength.color : 'bg-muted'
              }`}
            />
          ))}
        </div>
        {strength.label && (
          <p className={`text-xs font-medium ${
            strength.level <= 1 ? 'text-red-500' :
            strength.level === 2 ? 'text-orange-500' :
            strength.level === 3 ? 'text-yellow-600' :
            'text-emerald-500'
          }`}>
            {strength.label}
          </p>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {requirements.map((req) => (
          <div
            key={req.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              req.met ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
