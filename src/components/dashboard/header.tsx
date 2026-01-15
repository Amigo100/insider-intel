'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { UserMenu } from './user-menu'
import { MobileMenuButton } from './sidebar'
import { cn } from '@/lib/utils'

interface HeaderProps {
  user: {
    email?: string | null
    name?: string | null
    avatarUrl?: string | null
  }
  onMenuToggle: () => void
}

interface SearchResult {
  ticker: string
  name: string
  sector: string | null
  has_recent_activity: boolean
}

export function Header({ user, onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    const searchCompanies = async () => {
      if (searchQuery.length < 1) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.results || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchCompanies, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          navigateToCompany(searchResults[selectedIndex].ticker)
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        break
    }
  }

  const navigateToCompany = (ticker: string) => {
    setSearchQuery('')
    setShowResults(false)
    setSelectedIndex(-1)
    router.push(`/dashboard/company/${ticker}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <MobileMenuButton onClick={onMenuToggle} />

      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search stocks..."
          className="pl-9 pr-4"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setSelectedIndex(-1)
          }}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true)
            }
          }}
          onKeyDown={handleKeyDown}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-lg">
            <ul className="py-1">
              {searchResults.map((result, index) => (
                <li key={result.ticker}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                      index === selectedIndex && 'bg-accent'
                    )}
                    onClick={() => navigateToCompany(result.ticker)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="font-semibold text-foreground">
                      {result.ticker}
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">
                      {result.name}
                    </span>
                    {result.has_recent_activity && (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No results message */}
        {showResults && searchResults.length === 0 && searchQuery.length >= 1 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover p-3 shadow-lg">
            <p className="text-sm text-muted-foreground">No companies found</p>
          </div>
        )}
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        <UserMenu user={user} />
      </div>
    </header>
  )
}
