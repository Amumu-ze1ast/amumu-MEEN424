'use client'
import { useState, useEffect, useRef } from 'react'

const keyTerms = [
  { term: 'Plant', def: 'The physical system being controlled, such as a motor, furnace, or robot arm.' },
  { term: 'Controller', def: 'The device or algorithm that computes the control signal based on the error.' },
  { term: 'Reference Input', def: 'The desired output value, also called the setpoint or command signal.' },
  { term: 'Error Signal', def: 'The difference between the reference input and the measured output: e = r - y.' },
  { term: 'Feedback', def: 'The process of routing the output back to the input for comparison with the reference.' },
  { term: 'Sensor', def: 'Measures the actual output and sends it back to the summing junction.' },
  { term: 'Disturbance', def: 'An unwanted signal that affects the plant output, such as road bumps in a car.' },
  { term: 'Setpoint', def: 'Another name for the reference input - the value we want the system to reach.' },
]

const examples = [
  { icon: '🚗', title: 'Cruise Control', open: 'Driver sets speed manually - no correction for hills.', closed: 'Speed sensor feeds back to throttle - maintains speed on hills automatically.' },
  { icon: '🌡', title: 'Thermostat', open: 'Timer turns heater on and off at fixed intervals.', closed: 'Temperature sensor feeds back - heater runs until room reaches setpoint.' },
  { icon: '✈', title: 'Autopilot', open: 'Pilot sets control surfaces manually - no correction for turbulence.', closed: 'Gyroscopes feed back attitude - surfaces adjust automatically to hold heading.' },
  { icon: '🤖', title: 'Robot Arm', open: 'Motor runs for fixed time - position depends on load.', closed: 'Encoder feeds back position - motor corrects until arm reaches target angle.' },
]

const performanceGoals = [
  { icon: '🛡', title: 'Stability', desc: 'The system must not oscillate or blow up. Closed-loop poles must be in the left half s-plane.', color: 'blue' },
  { icon: '🎯', title: 'Accuracy', desc: 'The output must reach and stay at the desired setpoint. Measured by steady-state error.', color: 'green' },
  { icon: '⚡', title: 'Speed', desc: 'The system must respond quickly. Measured by rise time, settling time, and bandwidth.', color: 'amber' },
  { icon: '🔒', title: 'Robustness', desc: 'The system must work despite uncertainties in the plant model and external disturbances.', color: 'purple' },
]

const colorMap: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  green:  'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  amber:  'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
  purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
}

const signalFlowItems = [
  { name: 'Forward path', desc: 'The path from input r(t) through the controller and plant to the output y(t). Gain = G(s).' },
  { name: 'Feedback path', desc: 'The path from output back to the summing junction through the sensor. Gain = H(s).' },
  { name: 'Loop gain', desc: 'The total gain around the feedback loop: G(s).H(s). Determines stability behavior.' },
  { name: 'Disturbance', desc: 'An unwanted signal entering the plant. Closed-loop systems reject disturbances automatically.' },
  { name: 'Summing junction', desc: 'The point where reference and feedback signals are combined to produce the error signal.' },
]

function CanvasOpenLoop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = 160
    let t = 0

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      const navy = '#0B2A4A'
      const gold = '#F59E0B'
      const gray = '#94a3b8'

      ctx.fillStyle = navy
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('Open-Loop System', 10, 18)

      const bw = 80, bh = 34
      const by = H * 0.42
      const blocks = [
        { x: W * 0.05, label: 'Reference\nr(t)',  dark: false },
        { x: W * 0.28, label: 'Controller',       dark: true  },
        { x: W * 0.52, label: 'Plant',            dark: true  },
        { x: W * 0.76, label: 'Output\ny(t)',     dark: false },
      ]

      // Connector lines
      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      blocks.slice(0, -1).forEach((b, i) => {
        ctx.beginPath()
        ctx.moveTo(b.x + bw, by + bh / 2)
        ctx.lineTo(blocks[i + 1].x, by + bh / 2)
        ctx.stroke()
      })

      // Arrowhead before last block
      const lastX = blocks[3].x
      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.moveTo(lastX - 8, by + bh / 2 - 5)
      ctx.lineTo(lastX, by + bh / 2)
      ctx.lineTo(lastX - 8, by + bh / 2 + 5)
      ctx.fill()

      // Traveling dot
      const progress = (t * 0.35) % 1
      const startX = blocks[0].x + bw
      const endX = blocks[3].x
      const dotX = startX + progress * (endX - startX)
      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.arc(dotX, by + bh / 2, 5, 0, Math.PI * 2)
      ctx.fill()

      // Blocks
      blocks.forEach((b) => {
        ctx.fillStyle = b.dark ? navy : '#e2e8f0'
        ctx.strokeStyle = b.dark ? navy : gray
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(b.x, by, bw, bh, 6)
        ctx.fill()
        ctx.stroke()

        const lines = b.label.split('\n')
        ctx.fillStyle = b.dark ? '#fff' : navy
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        lines.forEach((line, li) => {
          ctx.fillText(line, b.x + bw / 2, by + bh / 2 - (lines.length - 1) * 6 + li * 12)
        })
        ctx.textAlign = 'left'
      })

      // No feedback label
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No feedback path - output cannot correct itself', W / 2, H - 10)
      ctx.textAlign = 'left'

      t += 0.025
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: '160px' }} />
}

function CanvasClosedLoop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = 200
    let t = 0

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      const navy = '#0B2A4A'
      const gold = '#F59E0B'
      const green = '#10b981'
      const topY = H * 0.32
      const bh = 34, bw = 64
      const sumX = W * 0.1, ctrlX = W * 0.28, plantX = W * 0.52
      const outX = W * 0.76, sensorX = W * 0.52
      const fbY = topY + bh + 38

      ctx.fillStyle = navy
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('Closed-Loop System', 10, 18)

      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(sumX + 28, topY + bh / 2); ctx.lineTo(ctrlX, topY + bh / 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(ctrlX + bw, topY + bh / 2); ctx.lineTo(plantX, topY + bh / 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(plantX + bw, topY + bh / 2); ctx.lineTo(outX, topY + bh / 2); ctx.stroke()

      const fwd = (t * 0.35) % 1
      const fwdX = sumX + 28 + fwd * (outX - sumX - 28)
      ctx.fillStyle = gold
      ctx.beginPath(); ctx.arc(fwdX, topY + bh / 2, 5, 0, Math.PI * 2); ctx.fill()

      ctx.strokeStyle = green; ctx.lineWidth = 2; ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(outX + bw * 0.5, topY + bh); ctx.lineTo(outX + bw * 0.5, fbY)
      ctx.lineTo(sensorX + bw * 0.5, fbY); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(sensorX + bw * 0.5, fbY); ctx.lineTo(sumX + 14, fbY)
      ctx.lineTo(sumX + 14, topY + bh); ctx.stroke()
      ctx.setLineDash([])

      const fbp = (t * 0.35 + 0.5) % 1
      const fbPath = [[outX + bw * 0.5, topY + bh],[outX + bw * 0.5, fbY],[sumX + 14, fbY],[sumX + 14, topY + bh]]
      const seg = Math.floor(fbp * 3)
      const segP = (fbp * 3) % 1
      if (seg < 3) {
        const x = fbPath[seg][0] + (fbPath[seg + 1][0] - fbPath[seg][0]) * segP
        const y = fbPath[seg][1] + (fbPath[seg + 1][1] - fbPath[seg][1]) * segP
        ctx.fillStyle = green; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill()
      }

      const fwdBlocks = [
        { x: ctrlX, y: topY, label: 'Controller', dark: true },
        { x: plantX, y: topY, label: 'Plant', dark: true },
        { x: outX, y: topY, label: 'Output\ny(t)', dark: false },
      ]
      fwdBlocks.forEach((b) => {
        ctx.fillStyle = b.dark ? navy : '#e2e8f0'
        ctx.strokeStyle = b.dark ? navy : '#94a3b8'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.roundRect(b.x, b.y, bw, bh, 6); ctx.fill(); ctx.stroke()
        const lines = b.label.split('\n')
        ctx.fillStyle = b.dark ? '#fff' : navy; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
        lines.forEach((line, li) => ctx.fillText(line, b.x + bw / 2, b.y + bh / 2 - (lines.length - 1) * 6 + li * 12))
        ctx.textAlign = 'left'
      })

      ctx.fillStyle = '#064e3b'; ctx.strokeStyle = green; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.roundRect(sensorX, fbY - 14, bw, 28, 6); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Sensor', sensorX + bw / 2, fbY + 4); ctx.textAlign = 'left'

      const errPulse = 0.5 + 0.5 * Math.sin(t * 3)
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(sumX + 14, topY + bh / 2, 14, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = 'rgba(239,68,68,' + (errPulse * 0.15) + ')'
      ctx.beginPath(); ctx.arc(sumX + 14, topY + bh / 2, 14, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('+', sumX + 14, topY + bh / 2 - 3)
      ctx.font = '9px sans-serif'; ctx.fillText('e(t)', sumX + 14, topY + bh / 2 + 9)
      ctx.textAlign = 'left'

      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(W * 0.01, topY + bh / 2); ctx.lineTo(sumX, topY + bh / 2); ctx.stroke()
      ctx.fillStyle = navy; ctx.font = '9px sans-serif'; ctx.fillText('r(t)', W * 0.01, topY + bh / 2 - 5)

      ctx.fillStyle = green; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Feedback path corrects the error automatically', W / 2, H - 8)
      ctx.textAlign = 'left'

      t += 0.025
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: '200px' }} />
}

function CanvasComparison() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = 180
    let t = 0

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width; const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H)

      const navy = '#0B2A4A', green = '#10b981', red = '#ef4444'
      const setpoint = H * 0.3, half = W / 2 - 10

      ctx.fillStyle = navy; ctx.font = 'bold 11px sans-serif'; ctx.fillText('Open-Loop Response', 10, 18)
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(10, setpoint); ctx.lineTo(half, setpoint); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.fillText('setpoint', 12, setpoint - 4)

      ctx.strokeStyle = red; ctx.lineWidth = 2; ctx.beginPath()
      for (let i = 0; i < half - 10; i++) {
        const drift = (i / (half - 10)) * 40
        const noise = 8 * Math.sin(i * 0.3 + t * 2)
        const y = setpoint + drift + noise
        if (i === 0) ctx.moveTo(10 + i, y); else ctx.lineTo(10 + i, y)
      }
      ctx.stroke()

      ctx.fillStyle = navy; ctx.font = 'bold 11px sans-serif'; ctx.fillText('Closed-Loop Response', W / 2 + 10, 18)
      const rx = W / 2 + 10
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(rx, setpoint); ctx.lineTo(W - 10, setpoint); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.fillText('setpoint', rx + 2, setpoint - 4)

      ctx.strokeStyle = green; ctx.lineWidth = 2; ctx.beginPath()
      for (let i = 0; i < W / 2 - 20; i++) {
        const tau = (i / (W / 2 - 20)) * 6
        const settle = (setpoint + 60) * Math.exp(-tau) + setpoint * (1 - Math.exp(-tau))
        const noise = 3 * Math.sin(i * 0.4 + t * 2) * Math.exp(-tau)
        if (i === 0) ctx.moveTo(rx + i, settle + noise); else ctx.lineTo(rx + i, settle + noise)
      }
      ctx.stroke()

      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()

      ctx.fillStyle = red; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Drifts - no correction', half / 2 + 10, H - 8)
      ctx.fillStyle = green; ctx.fillText('Settles to setpoint', W * 0.75, H - 8)
      ctx.textAlign = 'left'

      t += 0.03
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return <canvas ref={canvasRef} className="w-full rounded-xl" style={{ height: '180px' }} />
}

export default function ControlBgPage() {
  const [mounted, setMounted] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [score, setScore] = useState<number | null>(null)
  useEffect(() => { setMounted(true) }, [])

  const questions = [
    { id: 1,  q: 'What is the main difference between open-loop and closed-loop systems?', options: ['Open-loop uses a sensor; closed-loop does not', 'Closed-loop uses feedback to correct errors; open-loop does not', 'Open-loop is more accurate than closed-loop', 'Closed-loop has no controller'], correct: 'Closed-loop uses feedback to correct errors; open-loop does not' },
    { id: 2,  q: 'The error signal e(t) in a closed-loop system is defined as:', options: ['e(t) = y(t) + r(t)', 'e(t) = r(t) - y(t)', 'e(t) = y(t) - r(t)', 'e(t) = r(t) times y(t)'], correct: 'e(t) = r(t) - y(t)' },
    { id: 3,  q: 'Which component measures the actual output and sends it back to the summing junction?', options: ['Controller', 'Plant', 'Sensor', 'Reference input'], correct: 'Sensor' },
    { id: 4,  q: 'The closed-loop transfer function with unity feedback H=1 is:', options: ['Y/R = G', 'Y/R = 1 + G', 'Y/R = G divided by (1 + G)', 'Y/R = G times H'], correct: 'Y/R = G divided by (1 + G)' },
    { id: 5,  q: 'A toaster that heats for a fixed time regardless of bread color is an example of:', options: ['Closed-loop control', 'Feedback control', 'Open-loop control', 'State-space control'], correct: 'Open-loop control' },
    { id: 6,  q: 'What does the term (1 + G) in the closed-loop denominator represent?', options: ['The sensor gain', 'The steady-state error', 'The loop gain accounting for feedback', 'The plant disturbance'], correct: 'The loop gain accounting for feedback' },
    { id: 7,  q: 'Which of the following is NOT a performance goal of a control system?', options: ['Stability', 'Robustness', 'Complexity', 'Accuracy'], correct: 'Complexity' },
    { id: 8,  q: 'In a cruise control system, what acts as the sensor?', options: ['The engine throttle', 'The speed sensor measuring wheel rotation', 'The steering wheel', 'The brake pedal'], correct: 'The speed sensor measuring wheel rotation' },
    { id: 9,  q: 'What happens to an open-loop system when a disturbance occurs?', options: ['It automatically corrects the output', 'It cannot detect or correct the error', 'It increases the gain to compensate', 'It shuts down to prevent damage'], correct: 'It cannot detect or correct the error' },
    { id: 10, q: 'The summing junction in a closed-loop system computes:', options: ['The product of input and output', 'The difference between reference and measured output', 'The total gain of the forward path', 'The derivative of the error signal'], correct: 'The difference between reference and measured output' },
    { id: 11, q: 'Which performance goal refers to the system reaching the desired value accurately?', options: ['Stability', 'Speed', 'Accuracy', 'Robustness'], correct: 'Accuracy' },
    { id: 12, q: 'The forward path gain in a block diagram is represented by:', options: ['H(s)', 'E(s)', 'G(s)', 'R(s)'], correct: 'G(s)' },
    { id: 13, q: 'When the error signal e(t) = 0, the closed-loop system has:', options: ['Just started operating', 'Reached its desired output', 'Lost its feedback signal', 'Become unstable'], correct: 'Reached its desired output' },
    { id: 14, q: 'Which of the following is a closed-loop system?', options: ['A fixed-speed fan with a switch', 'A toaster with a timer', 'A thermostat that maintains room temperature', 'A lamp controlled by a wall switch'], correct: 'A thermostat that maintains room temperature' },
    { id: 15, q: 'Stability in a control system means:', options: ['The system responds as fast as possible', 'The output never changes', 'The system does not oscillate or grow unbounded', 'The gain is always equal to 1'], correct: 'The system does not oscillate or grow unbounded' },
  ]

  function handleMC(qid: number, option: string) {
    if (submitted[qid]) return
    setAnswers(prev => ({ ...prev, [qid]: option }))
    setSubmitted(prev => ({ ...prev, [qid]: true }))
  }

  function handleFinish() {
    let s = 0
    questions.forEach(q => {
      if (submitted[q.id] && answers[q.id] === q.correct) s++
    })
    setScore(s)
  }

  function resetQuiz() {
    setAnswers({})
    setSubmitted({})
    setScore(null)
  }

  const cardStyle = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.5s ease ' + delay + 's',
  })

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-navy-500 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono">
            <a href="/schedule" className="text-gold-400 hover:text-gold-300 transition-colors">Schedule</a>
            <span className="text-white/30">›</span>
            <span className="text-white/50">Control System Background</span>
          </div>
          <div className="flex items-center gap-3 mb-3" style={cardStyle(0)}>
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-heading font-bold text-white text-sm shrink-0">W1</div>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-widest">Control Foundations</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2" style={cardStyle(0.1)}>
            Control System Background
          </h1>
          <p className="text-white/60 text-sm max-w-xl" style={cardStyle(0.2)}>
            Open-loop vs closed-loop systems. Block diagrams, signal flow, and the feedback loop.
          </p>
          <div className="flex items-center gap-3 mt-6" style={cardStyle(0.3)}>
            <button
              onClick={() => setPdfOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white"
            >
              <span>‹</span> Course Intro
            </button>
            <div className="flex-1" />
            <a href="/notes/modeling"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white">
              Mathematical Modeling <span>›</span>
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* What is a control system */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.1)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">What is a control system?</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            A control system is a set of devices that manages, commands, or regulates the behavior of another system to achieve a desired result. The key idea is that we want a physical process to behave in a specific way, and the control system makes that happen.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '📥', label: 'Input r(t)', desc: 'What we want the system to do - the desired behavior or setpoint' },
              { icon: '⚙️', label: 'Process G(s)', desc: 'The physical system being controlled - motor, furnace, robot arm' },
              { icon: '📤', label: 'Output y(t)', desc: 'What the system actually does - speed, temperature, position' },
            ].map((item, i) => (
              <div key={i} className="bg-navy-500/5 rounded-xl p-3 text-center hover:bg-navy-500/10 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-heading font-bold text-navy-500 text-sm mb-1 font-mono">{item.label}</div>
                <div className="text-xs text-navy-300 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Open loop */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.15)}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔓</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Open-loop systems</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">No feedback</span>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            In an open-loop system, the output has no effect on the input. The controller sends a fixed command to the plant and hopes for the best. There is no mechanism to detect or correct errors.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <CanvasOpenLoop />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 hover:bg-green-100 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-green-700 text-sm mb-1">Advantages</div>
              <ul className="space-y-1">
                {['Simple and inexpensive', 'Easy to design and build', 'Stable if well calibrated'].map((p, i) => (
                  <li key={i} className="flex gap-2 items-start text-xs text-green-700">
                    <span className="mt-1 font-bold">+</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-200 hover:bg-red-100 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-red-700 text-sm mb-1">Disadvantages</div>
              <ul className="space-y-1">
                {['Cannot correct disturbances', 'Sensitive to parameter changes', 'No accuracy guarantee'].map((p, i) => (
                  <li key={i} className="flex gap-2 items-start text-xs text-red-700">
                    <span className="mt-1 font-bold">-</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Closed loop */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.2)}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔄</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Closed-loop systems</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">With feedback</span>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            A closed-loop system uses the measured output to continuously adjust the input. A sensor measures what is actually happening, compares it to what we want, and the error drives the controller to correct the difference.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <CanvasClosedLoop />
          </div>
          <div className="glass rounded-xl p-4 hover:bg-navy-500/8 transition-colors duration-200">
            <div className="font-heading font-bold text-navy-500 text-sm mb-2">The error signal</div>
            <div className="font-mono text-center text-lg font-bold text-gold-600 py-2">
              e(t) = r(t) - y(t)
            </div>
            <p className="text-xs text-navy-300 text-center mt-1">
              r(t) = reference input (what we want) &nbsp; y(t) = measured output (what we have)
            </p>
          </div>
        </div>

        {/* Transfer functions */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.25)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📐</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Transfer functions and block algebra</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-5">
            A transfer function G(s) is the Laplace-domain ratio of output to input. It lets us represent complex differential equations as simple algebraic fractions we can combine using block diagram rules.
          </p>
          <div className="space-y-3">
            <div className="glass rounded-xl p-4 hover:bg-navy-500/8 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div className="font-heading font-semibold text-navy-500 text-sm">Open-loop: no feedback</div>
              </div>
              <div className="bg-navy-500 rounded-lg p-3 font-mono text-center">
                <div className="text-gold-400 text-sm">Y(s) = G(s) . R(s)</div>
                <div className="text-white/40 text-xs mt-1">Output = Plant gain x Input</div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover:bg-navy-500/8 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div className="font-heading font-semibold text-navy-500 text-sm">Derivation steps</div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Error definition', eq: 'E(s) = R(s) - Y(s)', note: 'summing junction' },
                  { label: 'Controller output', eq: 'U(s) = G(s) . E(s)', note: 'forward path' },
                  { label: 'Substitute E(s)', eq: 'Y(s) = G(s)[R(s) - Y(s)]', note: 'combine' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors duration-150">
                    <span className="text-xs text-navy-300 w-28 shrink-0">{step.label}</span>
                    <span className="font-mono text-sm text-gold-600 flex-1">{step.eq}</span>
                    <span className="text-xs text-navy-300 italic">{step.note}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-4 bg-navy-500 hover:bg-navy-400 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gold-500 text-navy-500 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div className="font-heading font-semibold text-white text-sm">Closed-loop result</div>
              </div>
              <div className="font-mono text-center py-2">
                <div className="text-white/60 text-xs mb-1">Y(s) + G(s).Y(s) = G(s).R(s)</div>
                <div className="text-white/60 text-xs mb-3">Y(s)[1 + G(s)] = G(s).R(s)</div>
                <div className="text-gold-400 text-2xl font-bold">Y(s)/R(s) = G(s) / [1 + G(s)]</div>
              </div>
              <p className="text-xs text-white/50 text-center mt-1">
                With sensor H(s): &nbsp; Y/R = G / (1 + GH)
              </p>
            </div>
            <div className="glass rounded-xl p-4 border-l-4 border-gold-500 hover:bg-navy-500/8 transition-colors duration-200">
              <div className="font-heading font-bold text-navy-500 text-sm mb-2">Why does the denominator become 1 + G?</div>
              <p className="text-xs text-navy-400 leading-relaxed">
                The feedback path creates a loop. Every time the signal travels around the loop it gets multiplied by G(s). The term (1 + G) accounts for this loop gain and is fundamental to stability analysis. When 1 + G = 0 the system poles are defined.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.28)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Side-by-side comparison</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <CanvasComparison />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="glass rounded-xl p-3 hover:bg-navy-500/8 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-navy-500 mb-2">Closed-loop transfer function</div>
              <div className="font-mono text-center text-base font-bold text-gold-600 py-1">Y/R = G / (1 + GH)</div>
              <p className="text-xs text-navy-300 mt-1 text-center">G = forward gain, H = feedback gain</p>
            </div>
            <div className="glass rounded-xl p-3 hover:bg-navy-500/8 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-navy-500 mb-2">Open-loop transfer function</div>
              <div className="font-mono text-center text-base font-bold text-gold-600 py-1">Y/R = G</div>
              <p className="text-xs text-navy-300 mt-1 text-center">Output depends only on forward path</p>
            </div>
          </div>
        </div>

        {/* Performance goals */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.3)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Performance goals of a control system</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            Every control system design must balance four competing goals. Understanding these prepares you for the design methods in Weeks 2 and 3.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {performanceGoals.map((g, i) => (
              <div key={i} className={'rounded-xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default ' + colorMap[g.color]}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{g.icon}</span>
                  <span className="font-heading font-bold text-sm">{g.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signal flow */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.33)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔀</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Signal flow concepts</h2>
          </div>
          <div className="space-y-2">
            {signalFlowItems.map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 hover:-translate-x-0.5 transition-all duration-200 group">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0 mt-2" />
                <div>
                  <span className="font-heading font-bold text-gold-600 text-sm group-hover:text-gold-700 transition-colors">{item.name}: </span>
                  <span className="text-sm text-navy-400 leading-relaxed">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-world examples */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.36)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌍</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Real-world examples</h2>
          </div>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div key={i} className="glass rounded-xl p-4 hover:bg-navy-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{ex.icon}</span>
                  <span className="font-heading font-bold text-navy-500 text-sm group-hover:text-navy-600 transition-colors">{ex.title}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-red-50 rounded-lg p-2 border border-red-100 hover:bg-red-100 transition-colors duration-150">
                    <div className="text-xs font-bold text-red-600 mb-1">Open-loop</div>
                    <div className="text-xs text-red-700 leading-relaxed">{ex.open}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-100 hover:bg-green-100 transition-colors duration-150">
                    <div className="text-xs font-bold text-green-600 mb-1">Closed-loop</div>
                    <div className="text-xs text-green-700 leading-relaxed">{ex.closed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key terms */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.38)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📖</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Key terms</h2>
          </div>
          <div className="space-y-2">
            {keyTerms.map((t, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 hover:-translate-x-0.5 transition-all duration-200 group">
                <span className="font-heading font-bold text-gold-600 text-sm w-32 shrink-0 group-hover:text-gold-700 transition-colors">{t.term}</span>
                <span className="text-sm text-navy-400 leading-relaxed">{t.def}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz button */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default" style={cardStyle(0.39)}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🧠</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Test your understanding</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            15 multiple choice questions covering everything from this session. Click an option to submit each answer instantly.
          </p>
          <button
            onClick={() => setQuizOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-navy-500 text-white font-semibold text-sm
                       hover:bg-navy-400 hover:-translate-y-0.5 hover:shadow-lg
                       transition-all duration-200"
          >
            Start quiz
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Next session */}
        <div className="rounded-2xl p-6 bg-navy-500 text-white relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style={cardStyle(0.4)}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: '#F59E0B', filter: 'blur(40px)', transform: 'translate(20%,-20%)' }} />
          <p className="text-xs text-gold-400 font-semibold uppercase tracking-widest mb-2">Coming up next</p>
          <h3 className="font-heading font-bold text-xl mb-1">Mathematical Modeling</h3>
          <p className="text-white/60 text-sm mb-5">
            Newton laws applied to mechanical systems. Free body diagrams and equations of motion.
          </p>
          <a href="/notes/modeling"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            Open notes
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

      </div>

      {/* PDF MODAL */}
      {pdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setPdfOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col"
            style={{ height: '85vh' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">PDF</div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-white text-sm">Course Syllabus</div>
                <div className="text-xs text-white/50 font-mono">MEEN 424 - Summer II 2026</div>
              </div>
              <a href="/syllabus.pdf" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </a>
              <button onClick={() => setPdfOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors shrink-0 text-sm font-bold">
                X
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src="/syllabus.pdf" className="w-full h-full" title="MEEN 424 Syllabus" style={{ border: 'none' }} />
            </div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.80)', backdropFilter: 'blur(8px)' }}
          onClick={() => setQuizOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col"
            style={{ height: '90vh' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="bg-navy-500 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">Q</div>
              <div className="flex-1">
                <div className="font-heading font-bold text-white text-sm">Control System Background — Quiz</div>
                <div className="text-xs text-white/50">{questions.length} multiple choice questions</div>
              </div>
              {score !== null && (
                <div className="px-3 py-1 rounded-lg bg-gold-500 text-navy-500 font-bold text-sm">
                  {score}/{questions.length}
                </div>
              )}
              <button onClick={() => { setQuizOpen(false); resetQuiz() }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors text-sm font-bold shrink-0">
                X
              </button>
            </div>

            {/* Score banner */}
            {score !== null && (
              <div className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 shrink-0 ${score >= 8 ? 'bg-green-50 text-green-700' : score >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                <span className="text-lg">{score >= 8 ? '🎉' : score >= 5 ? '👍' : '📚'}</span>
                {score >= 8 ? 'Excellent! You have a strong grasp of control system fundamentals.' : score >= 5 ? 'Good effort! Review the sections you missed and try again.' : 'Keep studying — revisit the notes above and retake the quiz.'}
                <button onClick={resetQuiz} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Retake</button>
              </div>
            )}

            {/* Questions */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {questions.map((q, qi) => {
                const isSubmitted = submitted[q.id]
                const userAns = answers[q.id] || ''
                const isCorrect = userAns === q.correct

                return (
                  <div key={q.id} className={'glass rounded-xl p-4 transition-all duration-300 ' + (isSubmitted ? (isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-400') : 'hover:-translate-y-0.5 hover:shadow-md')}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{q.id}</span>
                      <p className="text-sm font-semibold text-navy-500 leading-relaxed">{q.q}</p>
                    </div>
                    <div className="space-y-2 ml-8">
                      {q.options.map((opt, oi) => {
                        let optStyle = 'bg-gray-50 border-gray-200 text-navy-400 hover:border-navy-300 hover:bg-navy-500/5'
                        if (isSubmitted) {
                          if (opt === q.correct) optStyle = 'bg-green-50 border-green-400 text-green-700 font-semibold'
                          else if (opt === userAns) optStyle = 'bg-red-50 border-red-400 text-red-600 line-through'
                          else optStyle = 'bg-gray-50 border-gray-200 text-navy-300 opacity-40'
                        }
                        return (
                          <button key={oi} onClick={() => handleMC(q.id, opt)}
                            className={'w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all duration-200 ' + optStyle}
                            disabled={isSubmitted}>
                            <span className="font-mono font-bold mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        )
                      })}
                      {isSubmitted && (
                        <p className={'text-xs mt-1 font-medium ' + (isCorrect ? 'text-green-600' : 'text-red-500')}>
                          {isCorrect ? 'Correct!' : 'Incorrect — correct answer is highlighted in green.'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Finish button */}
              {score === null && (
                <button onClick={handleFinish}
                  className="w-full py-3 rounded-xl bg-gold-500 text-navy-500 font-heading font-bold text-sm hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                  Finish and see score
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
