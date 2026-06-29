'use client'
import { useState, useEffect, useRef } from 'react'

const outcomes = [
  {
    num: 1,
    verb: 'Model',
    title: 'Model mechanical systems using Newton\'s laws and derive equations of motion',
    desc: 'Apply Newton\'s second law to construct free body diagrams and derive differential equations of motion for spring-mass-damper systems, including single and multi-DOF configurations.',
    weeks: ['Week 1 - Days 3-4', 'Week 3 - Day 12'],
    assessments: ['Homework sets', 'Project 1', 'Test 1'],
    color: 'blue',
  },
  {
    num: 2,
    verb: 'Analyze',
    title: 'Analyze system responses using differential equations and linear algebra',
    desc: 'Solve ODEs using Laplace transforms, apply matrix methods for multi-DOF systems, and interpret pole-zero plots in both time-domain and frequency-domain.',
    weeks: ['Week 1 - Day 4', 'Week 2', 'Week 4 - Days 14-15'],
    assessments: ['Test 1', 'Test 2', 'Homework sets'],
    color: 'green',
  },
  {
    num: 3,
    verb: 'Design',
    title: 'Design and evaluate feedback control systems using root locus and frequency domain methods',
    desc: 'Design compensators (PID, lead, lag) to meet performance specifications. Use root locus and Bode plot techniques iteratively with MATLAB/Simulink.',
    weeks: ['Week 2', 'Week 3 - Days 9-11'],
    assessments: ['Project 1', 'Test 1'],
    color: 'amber',
  },
  {
    num: 4,
    verb: 'Simulate',
    title: 'Simulate and assess controller performance through analysis and simulation tools',
    desc: 'Use MATLAB and/or Simulink to simulate closed-loop system behavior, validate analytical predictions, and assess stability margins and transient response quality.',
    weeks: ['Week 1 - Day 4', 'Week 3', 'Week 5 - Day 18'],
    assessments: ['Project 1', 'Project 2', 'Final Exam'],
    color: 'rose',
  },
  {
    num: 5,
    verb: 'Achieve',
    title: 'Specify and achieve desired vibration behavior in a mechanical system',
    desc: 'Select or design vibration mitigation strategies including passive isolators, dynamic vibration absorbers, and active control systems to meet specified constraints.',
    weeks: ['Week 4 - Day 16', 'Week 5'],
    assessments: ['Project 2', 'Final Exam'],
    color: 'purple',
  },
]

const abetMappings = [
  { criterion: '3(a)', title: 'Identify, formulate & solve', desc: 'Students identify, formulate, and solve vibration and control problems by applying principles of engineering, science, and mathematics at the undergraduate level.', outcomes: [1, 2, 3] },
  { criterion: '3(b)', title: 'Apply engineering design', desc: 'Design feedback controllers and vibration suppression systems that meet specified performance requirements within realistic constraints.', outcomes: [3, 4, 5] },
  { criterion: '3(e)', title: 'Use modern tools', desc: 'Use MATLAB, Simulink, and analytical techniques to model, simulate, and evaluate mechanical and control systems.', outcomes: [4] },
]

const colorMap: Record<string, { badge: string; dot: string; ring: string; num: string }> = {
  blue:   { badge: 'bg-blue-50 text-blue-700 border border-blue-200',     dot: 'bg-blue-500',   ring: 'ring-blue-200',   num: 'bg-blue-500' },
  green:  { badge: 'bg-green-50 text-green-700 border border-green-200',   dot: 'bg-green-500',  ring: 'ring-green-200',  num: 'bg-green-500' },
  amber:  { badge: 'bg-amber-50 text-amber-700 border border-amber-200',   dot: 'bg-amber-500',  ring: 'ring-amber-200',  num: 'bg-amber-500' },
  rose:   { badge: 'bg-rose-50 text-rose-700 border border-rose-200',     dot: 'bg-rose-500',   ring: 'ring-rose-200',   num: 'bg-rose-500' },
  purple: { badge: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500', ring: 'ring-purple-200', num: 'bg-purple-500' },
}

function OutcomeCard({ outcome, index }: { outcome: typeof outcomes[0]; index: number }) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const col = colorMap[outcome.color]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="glass rounded-2xl overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left
                   hover:bg-navy-500/5 transition-colors duration-200 group"
      >
        {/* Number badge */}
        <div className={`w-10 h-10 rounded-xl ${col.num} text-white flex items-center
                        justify-center font-heading font-bold text-sm shrink-0
                        transition-all duration-200 group-hover:scale-110 group-hover:shadow-md`}>
          {outcome.num}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
              {outcome.verb}
            </span>
          </div>
          <div className="font-heading font-semibold text-navy-500 text-sm leading-snug">
            {outcome.title}
          </div>
        </div>

        <div
          className="w-6 h-6 rounded-full bg-navy-50 flex items-center justify-center
                     text-navy-400 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      <div
        className="overflow-hidden"
        style={{ maxHeight: open ? '600px' : '0px', transition: 'max-height 0.4s ease' }}
      >
        <div className="px-6 pb-6 border-t border-navy-500/8">
          <p className="text-sm text-navy-400 leading-relaxed mt-4 mb-5">
            {outcome.desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weeks covered */}
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-widest
                            text-navy-300 mb-3">
                Weeks covered
              </p>
              <div className="space-y-1.5">
                {outcome.weeks.map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${col.dot}`} />
                    <span className="text-xs text-navy-400 font-mono">{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessments */}
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-widest
                            text-navy-300 mb-3">
                Assessed by
              </p>
              <div className="flex flex-wrap gap-1.5">
                {outcome.assessments.map((a, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1
                                           bg-gold-50 text-gold-700
                                           border border-gold-200 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Outcomes() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-navy-500 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(70px)', transform: 'translate(30%,-30%)' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-2"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease' }}
          >
            MEEN 424 - Summer II 2026
          </p>
          <h1
            className="font-heading text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s ease 0.1s' }}
          >
            Course Outcomes
          </h1>
          <p
            className="text-white/60 text-sm"
            style={{ opacity: mounted ? 1 : 0, transition: 'all 0.5s ease 0.2s' }}
          >
            SACS learning outcomes and ABET criterion mapping
          </p>
        </div>
      </section>

      {/* SACS OUTCOMES */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p className="section-label">SACS instruction outcomes</p>
        <p className="text-sm text-navy-300 mb-6">
          Upon completion of this course, students will be able to:
        </p>
        <div className="space-y-4">
          {outcomes.map((o, i) => (
            <OutcomeCard key={o.num} outcome={o} index={i} />
          ))}
        </div>
      </section>

      {/* ABET SECTION */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <p className="section-label">ABET criterion mapping</p>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.9z"
                      fill="white"/>
              </svg>
            </div>
            <div>
              <div className="font-heading font-bold text-navy-500 mb-1">
                ABET Accreditation — Criterion 3
              </div>
              <p className="text-sm text-navy-300 leading-relaxed">
                MEEN 424 satisfies the following ABET student outcome criteria through
                its combination of analytical work, design projects, and assessments.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {abetMappings.map((m, i) => (
            <div
              key={i}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 px-3 py-1.5 rounded-lg bg-navy-500
                                font-mono text-xs font-bold text-gold-400">
                  {m.criterion}
                </div>
                <div className="flex-1">
                  <div className="font-heading font-semibold text-navy-500 mb-1">
                    {m.title}
                  </div>
                  <p className="text-sm text-navy-300 leading-relaxed mb-3">
                    {m.desc}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-navy-300 font-medium">
                      Covered by outcomes:
                    </span>
                    {m.outcomes.map((n) => (
                      <span
                        key={n}
                        className={`w-6 h-6 rounded-full flex items-center justify-center
                                   text-xs font-bold text-white
                                   ${colorMap[outcomes[n-1].color].num}`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}