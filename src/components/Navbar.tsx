'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/',          label: 'Home' },
  { href: '/schedule',  label: 'Schedule' },
  { href: '/outcomes',  label: 'Outcomes' },
  { href: '/projects',  label: 'Projects' },
  { href: '/resources', label: 'Resources' },
  { href: '/notes/intro', label: 'Notes' },
  { href: '/quiz',      label: 'Quiz' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-navy-500 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-navy-500
                       font-bold text-xs transition-all duration-200 group-hover:scale-110"
            style={{ background: '#F59E0B' }}
          >
            ME
          </span>
          <span className="font-heading font-bold text-sm tracking-wide">
            MEEN 424
            <span className="text-gold-400 ml-1.5 font-normal text-xs opacity-80">
              Summer II 2026
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-gold-500 text-navy-500 shadow-gold font-semibold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-5 h-0.5 bg-white mb-1 transition-all" />
          <div className="w-5 h-0.5 bg-white mb-1 transition-all" />
          <div className="w-5 h-0.5 bg-white transition-all" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-gold-500 text-navy-500 font-semibold'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}