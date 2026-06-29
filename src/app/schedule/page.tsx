'use client'
import { useState, useEffect, useRef } from 'react'

const weeks = [
  {
    num: 1,
    title: 'Control Foundations',
    dates: 'Jun 28 & Jul 1, 2, 3',
    dot: 'bg-blue-500',
    numColor: 'bg-blue-500',
    topics: [
      { name: 'Course Intro & Overview', desc: 'Syllabus walkthrough, grading structure, introduction to vibration vs. control systems.', href: '/Syllabus.pdf', isPdf: true },
      { name: 'Control System Background', desc: 'Open-loop vs. closed-loop systems. Block diagrams, signal flow, feedback concepts.', href: '/notes/control-bg', isPdf: false },
      { name: 'Modeling in the Frequency Domain', desc: 'Chapter 2 — Laplace transform review. Transform pairs, properties, and worked examples.', href: '/notes/laplace', isPdf: false },
      { name: 'Mathematical Modeling', desc: "Newton's laws applied to mechanical systems. Free body diagrams, equations of motion.", href: '/notes/modeling', isPdf: false },
      { name: 'Transfer Functions & Responses', desc: 'Laplace transforms, poles and zeros. Step, impulse, and ramp responses.', href: '/notes/transfer-fn', isPdf: false },
    ],
    deadlines: [{ label: 'Project 1 Assigned', type: 'assign' }],
  },
  {
    num: 2,
    title: 'Stability & Frequency Design',
    dates: 'Jul 7, 8, 9, 10',
    dot: 'bg-green-500',
    numColor: 'bg-green-500',
    topics: [
      { name: 'Stability of Dynamic Systems', desc: 'Routh-Hurwitz criterion. Pole locations in the s-plane and their effect on system behavior.', href: '/notes/stability', isPdf: false },
      { name: 'Root Locus Techniques', desc: 'How closed-loop poles move as gain K varies. Construction rules and asymptotes.', href: '/notes/root-locus', isPdf: false },
      { name: 'Frequency Response & Bode Plots', desc: 'Sinusoidal steady-state response. Gain margin, phase margin, bandwidth.', href: '/notes/frequency', isPdf: false },
    ],
    deadlines: [{ label: 'Test 1 - Jul 10', type: 'test' }],
  },
  {
    num: 3,
    title: 'Controller Design & Free Vibration',
    dates: 'Jul 14, 15, 16, 17',
    dot: 'bg-amber-500',
    numColor: 'bg-amber-500',
    topics: [
      { name: 'Performance Specs & Compensation', desc: 'Translating specs into pole requirements. Lead, lag, PID compensators.', href: '/notes/compensation', isPdf: false },
      { name: 'State-Space Analysis', desc: 'State variable form. Controllability, observability, pole placement.', href: '/notes/state-space', isPdf: false },
      { name: 'Free Vibration of SDOF Systems', desc: 'Natural frequency, damping ratio. Underdamped, critically damped, overdamped.', href: '/notes/free-vibration', isPdf: false },
    ],
    deadlines: [
      { label: 'Project 1 Due - Jul 17', type: 'due' },
      { label: 'Project 2 Assigned', type: 'assign' },
    ],
  },
  {
    num: 4,
    title: 'Forced Vibration & Multi-DOF',
    dates: 'Jul 21, 22, 23, 24',
    dot: 'bg-rose-500',
    numColor: 'bg-rose-500',
    topics: [
      { name: 'Harmonic Excitation & Resonance', desc: 'Steady-state response to sinusoidal forcing. Magnification factor vs frequency ratio.', href: '/notes/harmonic', isPdf: false },
      { name: 'General Forced Vibration', desc: 'Response to arbitrary excitation using convolution. Impulse response function.', href: '/notes/forced', isPdf: false },
      { name: 'Multi-DOF Vibrating Systems', desc: 'Matrix equations of motion. Natural frequencies and mode shapes.', href: '/notes/multi-dof', isPdf: false },
      { name: 'Vibration Suppression', desc: 'Passive isolators, dynamic vibration absorbers, active vibration control.', href: '/notes/suppression', isPdf: false },
    ],
    deadlines: [{ label: 'Test 2 - Jul 24', type: 'test' }],
  },
  {
    num: 5,
    title: 'Integration & Final Exam',
    dates: 'Jul 28, 29, 30, 31',
    dot: 'bg-purple-500',
    numColor: 'bg-purple-500',
    topics: [
      { name: 'Feedback in Vibration Control', desc: 'Active vibration control using feedback. Sensors, controller, actuator.', href: '/notes/feedback-avc', isPdf: false },
      { name: 'Integration of Control + Vibration', desc: 'Bridging both halves: control design for vibration objectives. Case studies.', href: '/notes/integration', isPdf: false },
      { name: 'Review & Case Studies', desc: 'Comprehensive review. Aerospace flutter, automotive NVH, civil structural monitoring.', href: '/notes/review', isPdf: false },
    ],
    deadlines: [
      { label: 'Project 2 Due - Jul 29', type: 'due' },
      { label: 'Final Exam - Jul 31', type: 'exam' },
    ],
  },
]

const deadlineBadge: Record<string, string> = {
  test:   'bg-red-50 text-red-600 border border-red-200',
  due:    'bg-teal-50 text-teal-600 border border-teal-200',
  assign: 'bg-blue-50 text-blue-600 border border-blue-200',
  exam:   'bg-purple-50 text-purple-600 border border-purple-200',
}

function WeekCard({ week, index }: { week: typeof weeks[0]; index: number }) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        className="glass rounded-2xl overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.5s ease ' + (index * 0.1) + 's, transform 0.5s ease ' + (index * 0.1) + 's',
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-navy-500/5 transition-colors duration-200 group"
        >
          <div className={'w-10 h-10 rounded-xl ' + week.numColor + ' text-white flex items-center justify-center font-heading font-bold text-sm shrink-0 group-hover:bg-gold-500 group-hover:text-navy-500 transition-colors duration-200'}>
            {week.num}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-semibold text-navy-500 text-base">{week.title}</div>
            <div className="text-xs text-navy-300 mt-0.5 font-mono">{week.dates}</div>
          </div>
          <div className="hidden sm:flex gap-2 flex-wrap justify-end">
            {week.deadlines.map((d, i) => (
              <span key={i} className={'text-xs font-semibold px-2.5 py-0.5 rounded-full ' + deadlineBadge[d.type]}>
                {d.label}
              </span>
            ))}
          </div>
          <div
            className="w-6 h-6 rounded-full bg-navy-50 flex items-center justify-center text-navy-400 shrink-0 transition-transform duration-300"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>

        <div
          className="overflow-hidden"
          style={{ maxHeight: open ? '900px' : '0px', transition: 'max-height 0.4s ease' }}
        >
          <div className="px-6 pb-5 border-t border-navy-500/8">
            <div className="mt-4 space-y-2">
              {week.topics.map((t, i) => (
                t.isPdf ? (
                  <button
                    key={i}
                    onClick={() => setPdfOpen(true)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-navy-500/5 transition-colors duration-150 group/topic text-left"
                  >
                    <span className={'w-2 h-2 rounded-full shrink-0 mt-1.5 ' + week.dot} />
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-sm text-navy-500 group-hover/topic:text-gold-600 transition-colors duration-150 flex items-center gap-1.5">
                        <span>{t.name}</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gold-100 text-gold-700 border border-gold-200">PDF</span>
                      </div>
                      <p className="text-xs text-navy-300 leading-relaxed mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ) : (
                  <a
                    key={i}
                    href={t.href}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-navy-500/5 transition-colors duration-150 group/topic"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className={'w-2 h-2 rounded-full shrink-0 mt-1.5 ' + week.dot} />
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-sm text-navy-500 group-hover/topic:text-gold-600 transition-colors duration-150 flex items-center gap-1.5">
                        <span>{t.name}</span>
                        <svg
                          className="w-3 h-3 opacity-0 group-hover/topic:opacity-100 -translate-x-1 group-hover/topic:translate-x-0 transition-all duration-150 text-gold-500"
                          viewBox="0 0 12 12" fill="none"
                        >
                          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-xs text-navy-300 leading-relaxed mt-0.5">{t.desc}</p>
                    </div>
                  </a>
                )
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-navy-500/8 flex gap-2 flex-wrap">
              {week.deadlines.map((d, i) => (
                <span key={i} className={'text-xs font-semibold px-3 py-1 rounded-full ' + deadlineBadge[d.type]}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pdfOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setPdfOpen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col"
            style={{ height: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-navy-500 px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-white text-sm">Course Syllabus</div>
                <div className="text-xs text-white/50 font-mono">MEEN 424 - Summer II 2026</div>
              </div>
              <a
                href="/Syllabus.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </a>
              <button
                onClick={() => setPdfOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors shrink-0 text-sm font-bold"
              >
                X
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe
                src="/Syllabus.pdf"
                className="w-full h-full"
                title="MEEN 424 Syllabus"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Schedule() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const allDates = [
    { date: 'Jun 28', event: 'First day of class', type: 'assign' },
    { date: 'Jul 4', event: 'Independence Day - No class', type: 'holiday' },
    { date: 'Jul 10', event: 'Test 1', type: 'test' },
    { date: 'Jul 17', event: 'Project 1 due', type: 'due' },
    { date: 'Jul 24', event: 'Test 2', type: 'test' },
    { date: 'Jul 29', event: 'Project 2 due', type: 'due' },
    { date: 'Jul 31', event: 'Final Exam', type: 'exam' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-navy-500 text-white py-12 px-4 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(70px)', transform: 'translate(30%,-30%)' }}
        />
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
            Course Schedule
          </h1>
          <p
            className="text-white/60 text-sm"
            style={{ opacity: mounted ? 1 : 0, transition: 'all 0.5s ease 0.2s' }}
          >
            Jun 28 to Jul 31 — 4 sessions per week — Click any section to expand, then click a topic to open its notes
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {weeks.map((w, i) => (
          <WeekCard key={w.num} week={w} index={i} />
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <p className="section-label">All deadlines at a glance</p>
        <div className="glass rounded-2xl overflow-hidden">
          {allDates.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-navy-500/5 transition-colors duration-150"
              style={{ borderBottom: i < allDates.length - 1 ? '1px solid rgba(11,42,74,0.07)' : 'none' }}
            >
              <span className="w-14 font-mono text-xs text-gold-600 font-semibold shrink-0">{row.date}</span>
              <span className="flex-1 text-navy-500 font-medium">{row.event}</span>
              <span className={'text-xs font-semibold px-2.5 py-0.5 rounded-full ' + (row.type === 'holiday' ? 'bg-gray-50 text-gray-400 border border-gray-200' : deadlineBadge[row.type])}>
                {row.type}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
