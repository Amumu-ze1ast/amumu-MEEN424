'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const stats = [
  { num: '5',  label: 'Weeks',    icon: '📆' },
  { num: '20', label: 'Sessions', icon: '🗓' },
  { num: '4',  label: 'Credits',  icon: '🎓' },
  { num: '2',  label: 'Projects', icon: '🔧' },
]

const cards = [
  { href: '/schedule',  icon: '📅', title: 'Schedule',  desc: 'Weekly topics, session dates, and all deadlines.' },
  { href: '/outcomes',  icon: '🎯', title: 'Outcomes',  desc: 'SACS learning outcomes and ABET criterion mapping.' },
  { href: '/projects',  icon: '🔧', title: 'Projects',  desc: 'Requirements and rubrics for Project 1 and Project 2.' },
  { href: '/resources', icon: '📚', title: 'Resources', desc: 'Syllabus, lecture notes, and reference materials.' },
  { href: '/quiz',      icon: '🧠', title: 'Quiz',      desc: 'Test your understanding of core concepts interactively.' },
]

const keyDates = [
  { date: 'Jun 28', event: 'First day of class',          type: 'start' },
  { date: 'Jul 4',  event: 'Independence Day — No class', type: 'holiday' },
  { date: 'Jul 10', event: 'Test 1',                      type: 'test' },
  { date: 'Jul 17', event: 'Project 1 due',               type: 'project' },
  { date: 'Jul 24', event: 'Test 2',                      type: 'test' },
  { date: 'Jul 29', event: 'Project 2 due',               type: 'project' },
  { date: 'Jul 31', event: 'Final Exam — Last day',       type: 'exam' },
]

const typeBadge: Record<string, string> = {
  test:    'bg-red-50    text-red-600    border border-red-200',
  project: 'bg-teal-50   text-teal-600   border border-teal-200',
  exam:    'bg-purple-50 text-purple-600 border border-purple-200',
  holiday: 'bg-gray-50   text-gray-400   border border-gray-200',
  start:   'bg-gold-50   text-gold-600   border border-gold-200',
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-navy-500 text-white relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(80px)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(60px)', transform: 'translate(-30%,30%)' }} />

        <div className="max-w-4xl mx-auto px-4 py-16 relative z-10">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-3"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease' }}
          >
            NC A&T State University · Mechanical Engineering
          </p>

          <h1
            className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight text-white"
          >
            MEEN 424
            <span className="block text-gold-400 text-3xl md:text-4xl font-medium mt-1">
                Vibrations &amp; Control
            </span>
          </h1>

          <p
            className="text-white/70 text-base mb-10"
            style={{ opacity: mounted ? 1 : 0, transition: 'all 0.6s ease 0.2s' }}
          >
            Summer II 2026 &nbsp;·&nbsp; Jun 28 – Jul 31 &nbsp;·&nbsp;
            Instructor: Amanuel Abrdo Tereda
          </p>

          {/* Stats */}
          <div className="flex gap-8 flex-wrap">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="glass rounded-xl px-5 py-3 text-center"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                  transition: `all 0.5s ease ${0.3 + i * 0.08}s`,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold font-heading text-white">{s.num}</div>
                <div className="text-xs text-white/60 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFO BANNER ── */}
      <section className="border-b border-navy-50 bg-navy-500/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap gap-6 text-sm text-navy-400">
          <span>📍 <strong className="text-navy-500">Location:</strong> McNair Hall — TBD</span>
          <span>🕐 <strong className="text-navy-500">Time:</strong> Mon – Thu, 2 hrs/session</span>
          <span>📧 <strong className="text-navy-500">Email:</strong> aatereda@ncat.edu</span>
          <span>🕐 <strong className="text-navy-500">Office Hours:</strong> By appointment</span>
        </div>
      </section>

      {/* ── NAV CARDS ── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="section-label">Course sections</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className="block glass glass-hover rounded-2xl p-5 group"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.5s ease ${0.1 + i * 0.07}s,
                             transform 0.5s ease ${0.1 + i * 0.07}s`,
              }}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="font-heading font-semibold text-navy-500 mb-1
                              group-hover:text-gold-600 transition-colors duration-200">
                {c.title}
              </div>
              <div className="text-sm text-navy-300 leading-relaxed">{c.desc}</div>
              <div className="mt-3 text-xs font-semibold text-gold-500 flex items-center gap-1
                              opacity-0 group-hover:opacity-100 -translate-x-2
                              group-hover:translate-x-0 transition-all duration-200">
                View section →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── KEY DATES ── */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <p className="section-label">Key dates</p>
        <div className="glass rounded-2xl overflow-hidden">
          {keyDates.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 text-sm
                         hover:bg-navy-500/5 transition-colors duration-150 group"
              style={{ borderBottom: i < keyDates.length - 1 ? '1px solid rgba(11,42,74,0.07)' : 'none' }}
            >
              <span className="w-14 font-mono text-xs text-gold-600 font-semibold shrink-0">
                {row.date}
              </span>
              <span className="flex-1 text-navy-500 group-hover:text-navy-600
                               transition-colors font-medium">
                {row.event}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeBadge[row.type]}`}>
                {row.type}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}