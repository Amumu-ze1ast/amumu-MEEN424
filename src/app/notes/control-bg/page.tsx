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

      const bg = '#f8fafc'
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const navy = '#0B2A4A'
      const gold = '#F59E0B'
      const gray = '#94a3b8'

      // Title
      ctx.fillStyle = navy
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('Open-Loop System', 10, 18)

      // Blocks
      const blocks = [
        { x: W * 0.08, label: 'Input\nr(t)' },
        { x: W * 0.32, label: 'Controller' },
        { x: W * 0.58, label: 'Plant' },
        { x: W * 0.82, label: 'Output\ny(t)' },
      ]

      const bw = 72, bh = 34, by = H * 0.48

      // Draw signal line
      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(blocks[0].x + bw, by + bh / 2)
      ctx.lineTo(blocks[3].x, by + bh / 2)
      ctx.stroke()

      // Animated dot traveling forward
      const progress = (t * 0.4) % 1
      const dotX = blocks[0].x + bw + progress * (blocks[3].x - blocks[0].x - bw)
      const dotY = by + bh / 2
      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.arc(dotX, dotY, 5, 0, Math.PI * 2)
      ctx.fill()

      // Draw blocks
      blocks.forEach((b) => {
        const isFirst = b === blocks[0]
        const isLast = b === blocks[blocks.length - 1]
        if (isFirst || isLast) {
          ctx.fillStyle = '#e2e8f0'
          ctx.strokeStyle = gray
        } else {
          ctx.fillStyle = '#0B2A4A'
          ctx.strokeStyle = navy
        }
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(b.x, by, bw, bh, 6)
        ctx.fill()
        ctx.stroke()

        const lines = b.label.split('\n')
        ctx.fillStyle = isFirst || isLast ? navy : '#ffffff'
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

      t += 0.03
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

      ctx.fillStyle = navy
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('Closed-Loop System', 10, 18)

      const topY = H * 0.32
      const bh = 34
      const bw = 64

      // Block positions
      const sumX = W * 0.1
      const ctrlX = W * 0.28
      const plantX = W * 0.52
      const outX = W * 0.76
      const sensorX = W * 0.52
      const fbY = topY + bh + 38

      // Forward path arrows
      ctx.strokeStyle = gold
      ctx.lineWidth = 2
      // sum to ctrl
      ctx.beginPath()
      ctx.moveTo(sumX + 28, topY + bh / 2)
      ctx.lineTo(ctrlX, topY + bh / 2)
      ctx.stroke()
      // ctrl to plant
      ctx.beginPath()
      ctx.moveTo(ctrlX + bw, topY + bh / 2)
      ctx.lineTo(plantX, topY + bh / 2)
      ctx.stroke()
      // plant to output
      ctx.beginPath()
      ctx.moveTo(plantX + bw, topY + bh / 2)
      ctx.lineTo(outX, topY + bh / 2)
      ctx.stroke()

      // Animated forward dot
      const fwd = (t * 0.35) % 1
      const fwdX = sumX + 28 + fwd * (outX - sumX - 28)
      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.arc(fwdX, topY + bh / 2, 5, 0, Math.PI * 2)
      ctx.fill()

      // Feedback path
      ctx.strokeStyle = green
      ctx.lineWidth = 2
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      ctx.moveTo(outX + bw * 0.5, topY + bh)
      ctx.lineTo(outX + bw * 0.5, fbY)
      ctx.lineTo(sensorX + bw * 0.5, fbY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(sensorX + bw * 0.5, fbY)
      ctx.lineTo(sumX + 14, fbY)
      ctx.lineTo(sumX + 14, topY + bh)
      ctx.stroke()
      ctx.setLineDash([])

      // Animated feedback dot
      const fbp = (t * 0.35 + 0.5) % 1
      const fbPath = [
        [outX + bw * 0.5, topY + bh],
        [outX + bw * 0.5, fbY],
        [sumX + 14, fbY],
        [sumX + 14, topY + bh],
      ]
      const totalSeg = fbPath.length - 1
      const seg = Math.floor(fbp * totalSeg)
      const segP = (fbp * totalSeg) % 1
      if (seg < totalSeg) {
        const x = fbPath[seg][0] + (fbPath[seg + 1][0] - fbPath[seg][0]) * segP
        const y = fbPath[seg][1] + (fbPath[seg + 1][1] - fbPath[seg][1]) * segP
        ctx.fillStyle = green
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw blocks
      const fwdBlocks = [
        { x: ctrlX, y: topY, label: 'Controller', dark: true },
        { x: plantX, y: topY, label: 'Plant', dark: true },
        { x: outX, y: topY, label: 'Output\ny(t)', dark: false },
      ]

      fwdBlocks.forEach((b) => {
        ctx.fillStyle = b.dark ? navy : '#e2e8f0'
        ctx.strokeStyle = b.dark ? navy : '#94a3b8'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(b.x, b.y, bw, bh, 6)
        ctx.fill()
        ctx.stroke()
        const lines = b.label.split('\n')
        ctx.fillStyle = b.dark ? '#fff' : navy
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        lines.forEach((line, li) => {
          ctx.fillText(line, b.x + bw / 2, b.y + bh / 2 - (lines.length - 1) * 6 + li * 12)
        })
        ctx.textAlign = 'left'
      })

      // Sensor block
      ctx.fillStyle = '#064e3b'
      ctx.strokeStyle = green
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(sensorX, fbY - 14, bw, 28, 6)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Sensor', sensorX + bw / 2, fbY + 4)
      ctx.textAlign = 'left'

      // Summing junction circle
      const errPulse = 0.5 + 0.5 * Math.sin(t * 3)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(sumX + 14, topY + bh / 2, 14, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = `rgba(239,68,68,${errPulse * 0.15})`
      ctx.beginPath()
      ctx.arc(sumX + 14, topY + bh / 2, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('+', sumX + 14, topY + bh / 2 - 3)
      ctx.font = '9px sans-serif'
      ctx.fillText('e(t)', sumX + 14, topY + bh / 2 + 9)
      ctx.textAlign = 'left'

      // Reference input arrow
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(W * 0.01, topY + bh / 2)
      ctx.lineTo(sumX, topY + bh / 2)
      ctx.stroke()
      ctx.fillStyle = navy
      ctx.font = '9px sans-serif'
      ctx.fillText('r(t)', W * 0.01, topY + bh / 2 - 5)

      // Labels
      ctx.fillStyle = green
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Feedback path corrects the error automatically', W / 2, H - 10)
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
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, W, H)

      const navy = '#0B2A4A'
      const gold = '#F59E0B'
      const green = '#10b981'
      const red = '#ef4444'

      const setpoint = H * 0.3
      const midY = H / 2
      const half = W / 2 - 10

      // Left: open loop
      ctx.fillStyle = navy
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('Open-Loop Response', 10, 18)

      // Setpoint line
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(10, setpoint)
      ctx.lineTo(half, setpoint)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.fillText('setpoint', 12, setpoint - 4)

      // Open loop signal - drifts away from setpoint
      ctx.strokeStyle = red
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < half - 10; i++) {
        const x = 10 + i
        const drift = (i / (half - 10)) * 40
        const noise = 8 * Math.sin(i * 0.3 + t * 2)
        const y = setpoint + drift + noise
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Right: closed loop
      ctx.fillStyle = navy
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('Closed-Loop Response', W / 2 + 10, 18)

      const rx = W / 2 + 10
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(rx, setpoint)
      ctx.lineTo(W - 10, setpoint)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.fillText('setpoint', rx + 2, setpoint - 4)

      // Closed loop signal - settles to setpoint
      ctx.strokeStyle = green
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < W / 2 - 20; i++) {
        const x = rx + i
        const tau = i / (W / 2 - 20) * 6
        const settle = (setpoint + 60) * Math.exp(-tau) + setpoint * (1 - Math.exp(-tau))
        const noise = 3 * Math.sin(i * 0.4 + t * 2) * Math.exp(-tau)
        const y = settle + noise
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Divider
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(W / 2, 0)
      ctx.lineTo(W / 2, H)
      ctx.stroke()

      // Bottom labels
      ctx.fillStyle = red
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Drifts - no correction', half / 2 + 10, H - 10)
      ctx.fillStyle = green
      ctx.fillText('Settles to setpoint', W * 0.75, H - 10)
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
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen bg-white">

      <section className="bg-navy-500 text-white py-12 px-4 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono">
            <a href="/schedule" className="text-gold-400 hover:text-gold-300 transition-colors">Schedule</a>
            <span className="text-white/30">›</span>
            <span className="text-white/50">Control System Background</span>
          </div>
          <div
            className="flex items-center gap-3 mb-3"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease' }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-heading font-bold text-white text-sm shrink-0">W1</div>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-widest">Control Foundations - Jul 1</span>
          </div>
          <h1
            className="font-heading text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s ease 0.1s' }}
          >
            Control System Background
          </h1>
          <p
            className="text-white/60 text-sm max-w-xl"
            style={{ opacity: mounted ? 1 : 0, transition: 'all 0.5s ease 0.2s' }}
          >
            Open-loop vs closed-loop systems. Block diagrams, signal flow, and the feedback loop.
          </p>
          <div
            className="flex items-center gap-3 mt-6"
            style={{ opacity: mounted ? 1 : 0, transition: 'all 0.5s ease 0.3s' }}
          >
            <a
              href="/syllabus.pdf"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white group"
            >
              <span>‹</span>
              Course Intro
            </a>
            <div className="flex-1" />
            <a
              href="/notes/modeling"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white group"
            >
              Mathematical Modeling
              <span>›</span>
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        <div
          className="glass rounded-2xl p-6"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.1s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">What is a control system?</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            A control system is a set of devices that manages, commands, or regulates the behavior of another system to achieve a desired result. The key idea is that we want a physical process to behave in a specific way, and the control system makes that happen.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '📥', label: 'Input', desc: 'What we want the system to do - the desired behavior' },
              { icon: '⚙️', label: 'Process', desc: 'The physical system being controlled - motor, furnace, robot' },
              { icon: '📤', label: 'Output', desc: 'What the system actually does - speed, temperature, position' },
            ].map((item, i) => (
              <div key={i} className="bg-navy-500/5 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-heading font-bold text-navy-500 text-sm mb-1">{item.label}</div>
                <div className="text-xs text-navy-300 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.15s' }}
        >
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
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <div className="font-heading font-semibold text-green-700 text-sm mb-1">Advantages</div>
              <ul className="space-y-1">
                {['Simple and inexpensive', 'Easy to design and build', 'Stable if well calibrated'].map((p, i) => (
                  <li key={i} className="flex gap-2 items-start text-xs text-green-700">
                    <span className="mt-1">+</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <div className="font-heading font-semibold text-red-700 text-sm mb-1">Disadvantages</div>
              <ul className="space-y-1">
                {['Cannot correct disturbances', 'Sensitive to parameter changes', 'No accuracy guarantee'].map((p, i) => (
                  <li key={i} className="flex gap-2 items-start text-xs text-red-700">
                    <span className="mt-1">-</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.2s' }}
        >
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
          <div className="glass rounded-xl p-4">
            <div className="font-heading font-bold text-navy-500 text-sm mb-2">The error signal</div>
            <div className="font-mono text-center text-lg font-bold text-gold-600 py-2">
              e(t) = r(t) - y(t)
            </div>
            <p className="text-xs text-navy-300 text-center mt-1">
              r(t) = reference input (what we want) &nbsp; y(t) = measured output (what we have)
            </p>
          </div>
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.25s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Side-by-side comparison</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <CanvasComparison />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="glass rounded-xl p-3">
              <div className="font-heading font-semibold text-navy-500 mb-2">Closed-loop transfer function</div>
              <div className="font-mono text-center text-base font-bold text-gold-600 py-1">Y/R = G / (1 + GH)</div>
              <p className="text-xs text-navy-300 mt-1 text-center">G = forward gain, H = feedback gain</p>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="font-heading font-semibold text-navy-500 mb-2">Open-loop transfer function</div>
              <div className="font-mono text-center text-base font-bold text-gold-600 py-1">Y/R = G</div>
              <p className="text-xs text-navy-300 mt-1 text-center">Output depends only on forward path</p>
            </div>
          </div>
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.3s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌍</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Real-world examples</h2>
          </div>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div key={i} className="glass rounded-xl p-4 hover:bg-navy-500/5 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{ex.icon}</span>
                  <span className="font-heading font-bold text-navy-500 text-sm">{ex.title}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                    <div className="text-xs font-bold text-red-600 mb-1">Open-loop</div>
                    <div className="text-xs text-red-700 leading-relaxed">{ex.open}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                    <div className="text-xs font-bold text-green-600 mb-1">Closed-loop</div>
                    <div className="text-xs text-green-700 leading-relaxed">{ex.closed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="glass rounded-2xl p-6"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.35s' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📖</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Key terms</h2>
          </div>
          <div className="space-y-2">
            {keyTerms.map((t, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 transition-colors group">
                <span className="font-heading font-bold text-gold-600 text-sm w-32 shrink-0 group-hover:text-gold-700 transition-colors">{t.term}</span>
                <span className="text-sm text-navy-400 leading-relaxed">{t.def}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl p-6 bg-navy-500 text-white relative overflow-hidden"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.4s' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: '#F59E0B', filter: 'blur(40px)', transform: 'translate(20%,-20%)' }} />
          <p className="text-xs text-gold-400 font-semibold uppercase tracking-widest mb-2">Coming up next</p>
          <h3 className="font-heading font-bold text-xl mb-1">Mathematical Modeling</h3>
          <p className="text-white/60 text-sm mb-5">
            Newton laws applied to mechanical systems. Free body diagrams and equations of motion.
          </p>
          <a
            href="/notes/modeling"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 transition-all duration-200 hover:shadow-lg"
          >
            Open notes
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

      </div>
    </div>
  )
}
