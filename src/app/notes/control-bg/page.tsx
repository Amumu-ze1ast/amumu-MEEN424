'use client'
import { useState, useEffect } from 'react'

const keyTerms = [
  { term: 'Plant',             def: 'The physical system being controlled, such as a motor, furnace, elevator, or robot arm.' },
  { term: 'Controller',        def: 'The device or algorithm that computes the control signal based on the error or reference input.' },
  { term: 'Reference Input',   def: 'The desired output value, also called the setpoint or command signal.' },
  { term: 'Error Signal',      def: 'The difference between the reference input and the measured output: e = r - y.' },
  { term: 'Feedback',          def: 'Routing the output back to the input for comparison with the reference to enable correction.' },
  { term: 'Sensor',            def: 'Measures the actual output and converts it to the form used by the controller.' },
  { term: 'Transient Response',def: 'The behavior of a system from its initial state to its final steady state after an input is applied.' },
  { term: 'Steady-State Error',def: 'The difference between the desired output and actual output after transients have died out.' },
  { term: 'Stability',         def: 'A system is stable if its natural response decays to zero as time approaches infinity.' },
  { term: 'Actuating Signal',  def: 'The signal that drives the plant after the error is processed by the controller.' },
  { term: 'Disturbance',       def: 'An unwanted external signal that affects the plant output, such as wind load or friction.' },
  { term: 'Natural Response',  def: 'The response of the system due to its own dynamics, independent of the input.' },
  { term: 'Forced Response',   def: 'The response of the system due to the input signal.' },
]

const examples = [
  { icon: '🚗', title: 'Cruise Control', open: 'Driver sets throttle manually - no correction for hills or wind.', closed: 'Speed sensor feeds back to throttle - maintains speed automatically.' },
  { icon: '🌡', title: 'Thermostat', open: 'Timer turns heater on/off at fixed intervals regardless of temperature.', closed: 'Temperature sensor feeds back - heater runs until room reaches setpoint.' },
  { icon: '🛗', title: 'Elevator', open: 'Motor runs for fixed time - floor leveling depends on load.', closed: 'Position sensor feeds back - elevator corrects until it levels at floor.' },
  { icon: '🤖', title: 'Robot Arm', open: 'Motor runs for fixed time - position depends on load and friction.', closed: 'Encoder feeds back position - motor corrects until arm reaches target.' },
]

const performanceGoals = [
  { icon: '⚡', title: 'Transient Response', desc: 'How the system behaves from start until steady state. Too fast causes discomfort; too slow causes impatience. Also critical for structural safety.', color: 'blue' },
  { icon: '🎯', title: 'Steady-State Accuracy', desc: 'How close the final output is to the desired value after transients die out. Poor accuracy means the system never quite reaches its goal.', color: 'green' },
  { icon: '🛡', title: 'Stability', desc: 'The natural response must decay to zero or oscillate. An unstable system grows without bound and can self-destruct. The most fundamental requirement.', color: 'red' },
  { icon: '🔒', title: 'Robustness', desc: 'The system must maintain performance despite uncertainties in the plant model, parameter changes, and external disturbances.', color: 'purple' },
]

const colorMap: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  green:  'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  red:    'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
  purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
}

// ══════════════════════════════════════════════════════════════════
// FIGURE 1 — Simplified system (pure SVG)
// ══════════════════════════════════════════════════════════════════
function Fig1SimplifiedSystem() {
  return (
    <svg viewBox="0 0 600 110" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes moveDot1 { 0%{transform:translateX(0)} 100%{transform:translateX(370px)} }
        .dot1 { animation: moveDot1 2.4s linear infinite; }
      `}</style>

      {/* Lines */}
      <line x1="130" y1="55" x2="210" y2="55" stroke="#F59E0B" strokeWidth="2" />
      <line x1="350" y1="55" x2="430" y2="55" stroke="#F59E0B" strokeWidth="2" />
      <line x1="570" y1="55" x2="595" y2="55" stroke="#F59E0B" strokeWidth="2" />
      {/* arrowhead */}
      <polygon points="427,50 435,55 427,60" fill="#F59E0B" />

      {/* Traveling dot */}
      <circle className="dot1" cx="130" cy="55" r="6" fill="#F59E0B" />

      {/* Block 1 — Input */}
      <rect x="20" y="36" width="110" height="38" rx="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="75" y="52" textAnchor="middle" fontSize="11" fill="#0B2A4A" fontWeight="400">Input</text>
      <text x="75" y="65" textAnchor="middle" fontSize="10" fill="#0B2A4A">(Desired Output)</text>

      {/* Block 2 — Control System */}
      <rect x="210" y="36" width="140" height="38" rx="7" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.5" />
      <text x="280" y="52" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Control</text>
      <text x="280" y="65" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">System</text>

      {/* Block 3 — Output */}
      <rect x="430" y="36" width="110" height="38" rx="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="485" y="52" textAnchor="middle" fontSize="11" fill="#0B2A4A">Output</text>
      <text x="485" y="65" textAnchor="middle" fontSize="10" fill="#0B2A4A">(Actual Result)</text>

      {/* Caption */}
      <text x="300" y="102" textAnchor="middle" fontSize="11" fill="#64748b">Figure 1: Simplified description of a control system</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// FIGURE 2 — Elevator response (SVG path animation)
// ══════════════════════════════════════════════════════════════════
function Fig2ElevatorResponse() {
  const pathD = "M 60 190 C 80 180, 100 140, 130 110 C 160 80, 180 72, 220 68 C 260 64, 300 63, 360 62 C 420 61, 470 61, 560 61"
  return (
    <svg viewBox="0 0 620 220" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes drawCurve { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .curve { stroke-dasharray: 700; stroke-dashoffset: 700; animation: drawCurve 3s ease forwards; }
        .label-t { opacity:0; animation: fadeIn 0.5s ease 1.5s forwards; }
        .label-s { opacity:0; animation: fadeIn 0.5s ease 2.5s forwards; }
        .label-e { opacity:0; animation: fadeIn 0.5s ease 3s forwards; }
      `}</style>

      {/* Axes */}
      <line x1="55" y1="20" x2="55" y2="195" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="55" y1="195" x2="600" y2="195" stroke="#cbd5e1" strokeWidth="1" />

      {/* Axis labels */}
      <text x="14" y="110" textAnchor="middle" fontSize="11" fill="#94a3b8" transform="rotate(-90,14,110)">Floor position</text>
      <text x="330" y="215" textAnchor="middle" fontSize="11" fill="#94a3b8">Time</text>

      {/* Desired floor dashed line */}
      <line x1="55" y1="60" x2="595" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,4" />
      <text x="590" y="56" textAnchor="end" fontSize="10" fill="#94a3b8">4th floor (desired)</text>

      {/* Elevator curve */}
      <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" className="curve" />

      {/* Transient bracket */}
      <g className="label-t">
        <line x1="60" y1="32" x2="310" y2="32" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,3" />
        <line x1="60" y1="28" x2="60" y2="36" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="310" y1="28" x2="310" y2="36" stroke="#ef4444" strokeWidth="1.5" />
        <text x="185" y="28" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="700">Transient response</text>
      </g>

      {/* Steady-state bracket */}
      <g className="label-s">
        <line x1="320" y1="32" x2="590" y2="32" stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" />
        <line x1="320" y1="28" x2="320" y2="36" stroke="#10b981" strokeWidth="1.5" />
        <line x1="590" y1="28" x2="590" y2="36" stroke="#10b981" strokeWidth="1.5" />
        <text x="455" y="28" textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="700">Steady-state</text>
      </g>

      {/* SS error arrow */}
      <g className="label-e">
        <line x1="560" y1="60" x2="560" y2="62" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="560" y1="62" x2="560" y2="72" stroke="#ef4444" strokeWidth="1.5" />
        <polygon points="555,65 560,60 565,65" fill="#ef4444" />
        <polygon points="555,69 560,74 565,69" fill="#ef4444" />
        <text x="568" y="64" fontSize="10" fill="#ef4444">SS</text>
        <text x="568" y="75" fontSize="10" fill="#ef4444">err</text>
      </g>

      {/* Caption */}
      <text x="310" y="215" textAnchor="middle" fontSize="11" fill="#64748b">Figure 2: Elevator response to pressing the 4th floor button</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// FIGURE 3 — Open-loop block diagram (pure SVG)
// ══════════════════════════════════════════════════════════════════
function Fig3OpenLoop() {
  return (
    <svg viewBox="0 0 640 160" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes moveDot3 { 0%{transform:translateX(0)} 100%{transform:translateX(440px)} }
        .dot3 { animation: moveDot3 2.2s linear infinite; }
        @keyframes pulseDist { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .dist3 { animation: pulseDist 1.5s ease infinite; }
      `}</style>

      {/* Reference arrow */}
      <line x1="8" y1="72" x2="40" y2="72" stroke="#64748b" strokeWidth="1.5" />
      <polygon points="36,67 42,72 36,77" fill="#64748b" />
      <text x="6" y="62" fontSize="10" fill="#64748b">Reference</text>
      <text x="6" y="73" fontSize="10" fill="#64748b">(Input)</text>

      {/* Connector lines */}
      <line x1="128" y1="72" x2="168" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <line x1="262" y1="72" x2="302" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <line x1="396" y1="72" x2="436" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <polygon points="432,67 438,72 432,77" fill="#F59E0B" />

      {/* Traveling dot */}
      <circle className="dot3" cx="128" cy="72" r="6" fill="#F59E0B" />

      {/* Disturbance */}
      <g className="dist3">
        <line x1="330" y1="38" x2="330" y2="55" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
        <polygon points="325,52 330,58 335,52" fill="#ef4444" />
        <text x="330" y="34" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">Disturbance</text>
      </g>

      {/* Block 1 — Input Transducer */}
      <rect x="42" y="54" width="86" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="85" y="69" textAnchor="middle" fontSize="10" fill="#0B2A4A">Input</text>
      <text x="85" y="81" textAnchor="middle" fontSize="10" fill="#0B2A4A">Transducer</text>

      {/* Block 2 — Controller */}
      <rect x="168" y="54" width="94" height="36" rx="6" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.5" />
      <text x="215" y="75" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Controller</text>

      {/* Block 3 — Plant */}
      <rect x="302" y="54" width="94" height="36" rx="6" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.5" />
      <text x="349" y="75" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Plant</text>

      {/* Block 4 — Output */}
      <rect x="436" y="54" width="96" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="484" y="69" textAnchor="middle" fontSize="10" fill="#0B2A4A">Controlled</text>
      <text x="484" y="81" textAnchor="middle" fontSize="10" fill="#0B2A4A">Output</text>

      {/* No feedback label */}
      <text x="320" y="125" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">No feedback path - output cannot correct itself</text>

      {/* Caption */}
      <text x="320" y="150" textAnchor="middle" fontSize="11" fill="#64748b">Figure 3: Open-loop control system block diagram</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// FIGURE 4 — Closed-loop block diagram (pure SVG)
// ══════════════════════════════════════════════════════════════════
function Fig4ClosedLoop() {
  return (
    <svg viewBox="0 0 660 230" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes moveFwd { 0%{transform:translateX(0)} 100%{transform:translateX(480px)} }
        @keyframes moveFb { 0%{stroke-dashoffset:340} 100%{stroke-dashoffset:0} }
        @keyframes pulseErr { 0%,100%{opacity:0.3} 50%{opacity:0.9} }
        @keyframes pulseDist4 { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .fwdDot { animation: moveFwd 2.2s linear infinite; }
        .fbPath { stroke-dasharray:340; animation: moveFb 2.2s linear infinite; }
        .errCircle { animation: pulseErr 1.5s ease infinite; }
        .dist4 { animation: pulseDist4 1.5s ease infinite; }
      `}</style>

      {/* Reference arrow */}
      <line x1="4" y1="72" x2="32" y2="72" stroke="#64748b" strokeWidth="1.5" />
      <polygon points="28,67 34,72 28,77" fill="#64748b" />
      <text x="4" y="62" fontSize="9" fill="#0B2A4A">r(t)</text>

      {/* Forward path lines */}
      <line x1="60" y1="72" x2="90" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <line x1="182" y1="72" x2="218" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <line x1="312" y1="72" x2="350" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <line x1="444" y1="72" x2="490" y2="72" stroke="#F59E0B" strokeWidth="2" />
      <polygon points="486,67 492,72 486,77" fill="#F59E0B" />

      {/* Actuating signal label */}
      <text x="194" y="65" fontSize="9" fill="#64748b">Actuating</text>
      <text x="194" y="75" fontSize="9" fill="#64748b">signal</text>

      {/* Forward dot */}
      <circle className="fwdDot" cx="60" cy="72" r="6" fill="#F59E0B" />

      {/* Disturbance */}
      <g className="dist4">
        <line x1="374" y1="38" x2="374" y2="54" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
        <polygon points="369,52 374,58 379,52" fill="#ef4444" />
        <text x="374" y="34" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">Disturbance</text>
      </g>

      {/* Feedback path */}
      <path d="M 490 90 L 490 160 L 340 160 L 340 180 L 46 180 L 46 90"
        fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5,4" className="fbPath" />
      <polygon points="41,94 46,88 51,94" fill="#10b981" />

      {/* Summing junction */}
      <circle cx="46" cy="72" r="14" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="2" className="errCircle" />
      <text x="46" y="70" textAnchor="middle" fontSize="13" fill="#ef4444" fontWeight="700">+</text>
      <text x="46" y="81" textAnchor="middle" fontSize="9" fill="#ef4444">e(t)</text>

      {/* Block 1 — Input Transducer */}
      <rect x="90" y="54" width="92" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="136" y="69" textAnchor="middle" fontSize="10" fill="#0B2A4A">Input</text>
      <text x="136" y="81" textAnchor="middle" fontSize="10" fill="#0B2A4A">Transducer</text>

      {/* Block 2 — Controller */}
      <rect x="218" y="54" width="94" height="36" rx="6" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.5" />
      <text x="265" y="75" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Controller</text>

      {/* Block 3 — Plant */}
      <rect x="350" y="54" width="94" height="36" rx="6" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.5" />
      <text x="397" y="75" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Plant</text>

      {/* Block 4 — Output */}
      <rect x="492" y="54" width="108" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="546" y="69" textAnchor="middle" fontSize="10" fill="#0B2A4A">Output</text>
      <text x="546" y="81" textAnchor="middle" fontSize="10" fill="#0B2A4A">(Ctrl. Variable)</text>

      {/* Output Transducer block */}
      <rect x="294" y="165" width="92" height="30" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
      <text x="340" y="178" textAnchor="middle" fontSize="10" fill="white">Output</text>
      <text x="340" y="189" textAnchor="middle" fontSize="10" fill="white">Transducer</text>

      {/* Caption */}
      <text x="330" y="222" textAnchor="middle" fontSize="11" fill="#64748b">Figure 4: Closed-loop (feedback) control system block diagram</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// FIGURE 5 — Design Process flowchart (pure SVG)
// ══════════════════════════════════════════════════════════════════
function Fig5DesignProcess() {
  const steps = [
    { label: '1. Define system requirements', sub: 'Identify specs: transient response, steady-state error, stability', color: '#F59E0B', text: '#0B2A4A' },
    { label: '2. Model the system',           sub: 'Derive transfer function or state-space model',                     color: '#0B2A4A', text: '#fff' },
    { label: '3. Design the controller',      sub: 'Select strategy: PID, root locus, frequency domain',               color: '#0B2A4A', text: '#fff' },
    { label: '4. Analyze performance',        sub: 'Check stability, transient response, steady-state error',           color: '#0B2A4A', text: '#fff' },
    { label: '5. Simulate',                   sub: 'Verify with MATLAB/Simulink before implementation',                color: '#0B2A4A', text: '#fff' },
    { label: '6. Implement and test',         sub: 'Build prototype, test, refine if needed',                          color: '#10b981', text: '#fff' },
  ]
  const bw = 300, bh = 44, cx = 320, startY = 16, gap = 14
  return (
    <svg viewBox="0 0 640 380" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes fadeInStep { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .step0{animation:fadeInStep 0.4s ease 0.1s both}
        .step1{animation:fadeInStep 0.4s ease 0.5s both}
        .step2{animation:fadeInStep 0.4s ease 0.9s both}
        .step3{animation:fadeInStep 0.4s ease 1.3s both}
        .step4{animation:fadeInStep 0.4s ease 1.7s both}
        .step5{animation:fadeInStep 0.4s ease 2.1s both}
        .iterArrow{opacity:0;animation:fadeInStep 0.6s ease 2.6s both}
      `}</style>

      {steps.map((step, i) => {
        const y = startY + i * (bh + gap)
        const hasArrow = i > 0
        return (
          <g key={i} className={`step${i}`}>
            {hasArrow && (
              <>
                <line x1={cx} y1={y - gap} x2={cx} y2={y - 2} stroke="#F59E0B" strokeWidth="2" />
                <polygon points={`${cx-5},${y-8} ${cx},${y-2} ${cx+5},${y-8}`} fill="#F59E0B" />
              </>
            )}
            <rect x={cx - bw/2} y={y} width={bw} height={bh} rx="8" fill={step.color} />
            <text x={cx} y={y + 17} textAnchor="middle" fontSize="12" fill={step.text} fontWeight="700">{step.label}</text>
            <text x={cx} y={y + 32} textAnchor="middle" fontSize="10" fill={step.text} opacity="0.8">{step.sub}</text>
          </g>
        )
      })}

      {/* Iterate arrow */}
      <g className="iterArrow">
        <path d={`M ${cx+bw/2} ${startY+bh/2} L ${cx+bw/2+36} ${startY+bh/2} L ${cx+bw/2+36} ${startY+5*(bh+gap)+bh/2} L ${cx+bw/2} ${startY+5*(bh+gap)+bh/2}`}
          fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,4" />
        <polygon points={`${cx+bw/2+4},${startY+5*(bh+gap)+bh/2-5} ${cx+bw/2},${startY+5*(bh+gap)+bh/2} ${cx+bw/2+4},${startY+5*(bh+gap)+bh/2+5}`} fill="#94a3b8" />
        <text x={cx+bw/2+46} y={startY+(5*(bh+gap)+bh)/2+4} fontSize="10" fill="#94a3b8" transform={`rotate(90,${cx+bw/2+46},${startY+(5*(bh+gap)+bh)/2+4})`} textAnchor="middle">Iterate if needed</text>
      </g>

      {/* Caption */}
      <text x="320" y="374" textAnchor="middle" fontSize="11" fill="#64748b">Figure 5: The control system design process</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// STABILITY SVG
// ══════════════════════════════════════════════════════════════════
function StabilitySVG() {
  // Pre-computed path data for each regime
  const stablePath = "M 20 90 C 40 88, 55 70, 70 58 C 85 46, 95 50, 110 52 C 125 54, 135 51, 150 52 C 165 53, 175 51, 190 52"
  const marginalPath = "M 220 52 C 235 38, 248 66, 262 52 C 276 38, 289 66, 303 52 C 317 38, 330 66, 344 52 C 358 38, 371 66, 384 52"
  const unstablePath = "M 420 80 C 432 76, 442 70, 452 64 C 465 56, 468 46, 475 36 C 482 24, 492 16, 502 8"
  return (
    <svg viewBox="0 0 600 130" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes drawStable { to{stroke-dashoffset:0} }
        @keyframes drawMarginal { to{stroke-dashoffset:0} }
        @keyframes drawUnstable { to{stroke-dashoffset:0} }
        .sPath{stroke-dasharray:300;stroke-dashoffset:300;animation:drawStable 1.5s ease 0.2s forwards}
        .mPath{stroke-dasharray:300;stroke-dashoffset:300;animation:drawMarginal 1.5s ease 0.8s forwards}
        .uPath{stroke-dasharray:200;stroke-dashoffset:200;animation:drawUnstable 1.2s ease 1.4s forwards}
      `}</style>

      {/* Dividers */}
      <line x1="205" y1="0" x2="205" y2="108" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="410" y1="0" x2="410" y2="108" stroke="#e2e8f0" strokeWidth="1" />

      {/* Baseline per region */}
      <line x1="10" y1="90" x2="198" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="215" y1="52" x2="398" y2="52" stroke="#e2e8f0" strokeWidth="0.5" />
      <line x1="415" y1="90" x2="598" y2="90" stroke="#e2e8f0" strokeWidth="0.5" />

      {/* Labels */}
      <text x="104" y="14" textAnchor="middle" fontSize="12" fill="#10b981" fontWeight="700">Stable</text>
      <text x="307" y="14" textAnchor="middle" fontSize="12" fill="#F59E0B" fontWeight="700">Marginal</text>
      <text x="507" y="14" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="700">Unstable</text>

      {/* Curves */}
      <path d={stablePath}   fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" className="sPath" />
      <path d={marginalPath} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" className="mPath" />
      <path d={unstablePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="uPath" />

      {/* Caption */}
      <text x="300" y="122" textAnchor="middle" fontSize="11" fill="#64748b">Natural response: stable (decays), marginal (oscillates), unstable (grows)</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// COMPARISON SVG
// ══════════════════════════════════════════════════════════════════
function ComparisonSVG() {
  const openPath  = "M 60 160 C 80 155, 100 145, 120 138 C 140 131, 160 128, 180 126 C 200 124, 220 128, 240 135 C 260 142, 270 152, 285 160"
  const closedPath = "M 340 160 C 360 140, 375 100, 390 80 C 405 60, 415 56, 440 54 C 465 52, 490 53, 560 53"
  return (
    <svg viewBox="0 0 620 175" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes drawOpen { to{stroke-dashoffset:0} }
        @keyframes drawClosed { to{stroke-dashoffset:0} }
        .oPath{stroke-dasharray:400;stroke-dashoffset:400;animation:drawOpen 1.8s ease 0.2s forwards}
        .cPath{stroke-dasharray:400;stroke-dashoffset:400;animation:drawClosed 1.8s ease 0.8s forwards}
      `}</style>

      {/* Divider */}
      <line x1="308" y1="0" x2="308" y2="155" stroke="#e2e8f0" strokeWidth="1" />

      {/* Left: Open-loop */}
      <text x="10" y="16" fontSize="11" fill="#0B2A4A" fontWeight="700">Open-Loop Response</text>
      <line x1="55" y1="52" x2="292" y2="52" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
      <text x="60" y="47" fontSize="10" fill="#94a3b8">setpoint</text>
      <path d={openPath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="oPath" />
      <text x="172" y="168" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="700">Drifts - cannot self-correct</text>

      {/* Right: Closed-loop */}
      <text x="318" y="16" fontSize="11" fill="#0B2A4A" fontWeight="700">Closed-Loop Response</text>
      <line x1="336" y1="52" x2="598" y2="52" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
      <text x="340" y="47" fontSize="10" fill="#94a3b8">setpoint</text>
      <path d={closedPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" className="cPath" />
      <text x="462" y="168" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="700">Settles to setpoint</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function ControlBgPage() {
  const [mounted, setMounted] = useState(false)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [score, setScore] = useState<number | null>(null)
  useEffect(() => { setMounted(true) }, [])

  const questions = [
    { id: 1,  q: 'What is the primary purpose of a control system?', options: ['To convert electrical signals to mechanical motion', 'To obtain a desired output with desired performance given a specified input', 'To amplify the input signal only', 'To measure temperature and pressure'], correct: 'To obtain a desired output with desired performance given a specified input' },
    { id: 2,  q: 'The error signal e(t) in a closed-loop system is defined as:', options: ['e(t) = y(t) + r(t)', 'e(t) = r(t) - y(t)', 'e(t) = y(t) - r(t)', 'e(t) = r(t) times y(t)'], correct: 'e(t) = r(t) - y(t)' },
    { id: 3,  q: 'Which component measures the actual output and converts it to a form used by the controller?', options: ['Controller', 'Plant', 'Output transducer (sensor)', 'Summing junction'], correct: 'Output transducer (sensor)' },
    { id: 4,  q: 'The closed-loop transfer function with unity feedback H=1 is:', options: ['Y/R = G', 'Y/R = 1 + G', 'Y/R = G divided by (1 + G)', 'Y/R = G times H'], correct: 'Y/R = G divided by (1 + G)' },
    { id: 5,  q: 'In the elevator example, what are the two key performance measures?', options: ['Speed and fuel efficiency', 'Transient response and steady-state error', 'Gain margin and phase margin', 'Natural frequency and damping ratio'], correct: 'Transient response and steady-state error' },
    { id: 6,  q: 'Which of the following is NOT one of the four primary reasons we build control systems?', options: ['Power amplification', 'Remote control', 'Convenience of input form', 'Noise elimination'], correct: 'Noise elimination' },
    { id: 7,  q: 'What does the total system response equal?', options: ['Input response + Output response', 'Natural response + Forced response', 'Transient response only', 'Steady-state response only'], correct: 'Natural response + Forced response' },
    { id: 8,  q: 'A system is stable when its natural response:', options: ['Grows without bound over time', 'Remains constant forever', 'Decays to zero or oscillates as time approaches infinity', 'Equals the forced response at all times'], correct: 'Decays to zero or oscillates as time approaches infinity' },
    { id: 9,  q: 'What is the main advantage of closed-loop over open-loop systems?', options: ['They are simpler to design', 'They use less power', 'They can correct for disturbances and are more accurate', 'They never need calibration'], correct: 'They can correct for disturbances and are more accurate' },
    { id: 10, q: 'In a closed-loop system, what drives the plant to make a correction?', options: ['The reference input directly', 'The sensor output directly', 'The actuating signal derived from the error', 'The disturbance signal'], correct: 'The actuating signal derived from the error' },
    { id: 11, q: 'What happens when the error signal e(t) = 0 in a closed-loop system?', options: ['The system shuts down', 'The controller increases gain', 'The system does not drive the plant since output equals desired value', 'The sensor stops measuring'], correct: 'The system does not drive the plant since output equals desired value' },
    { id: 12, q: 'A thermistor in a temperature control system acts as:', options: ['A controller', 'An output transducer that converts temperature to electrical signal', 'A summing junction', 'A reference input device'], correct: 'An output transducer that converts temperature to electrical signal' },
    { id: 13, q: 'Which step comes FIRST in the control system design process?', options: ['Design the controller', 'Simulate with MATLAB', 'Define system requirements and specifications', 'Implement and test the prototype'], correct: 'Define system requirements and specifications' },
    { id: 14, q: 'In an open-loop system, what happens when a disturbance occurs?', options: ['The system automatically compensates', 'The error signal activates correction', 'The disturbance cannot be detected or corrected', 'The sensor doubles the gain'], correct: 'The disturbance cannot be detected or corrected' },
    { id: 15, q: 'The steady-state error in the elevator example would mean:', options: ['The elevator moves too fast', 'The elevator does not level properly at the correct floor', 'The elevator doors do not open', 'The transient response is too slow'], correct: 'The elevator does not level properly at the correct floor' },
  ]

  function handleMC(qid: number, option: string) {
    if (submitted[qid]) return
    setAnswers(prev => ({ ...prev, [qid]: option }))
    setSubmitted(prev => ({ ...prev, [qid]: true }))
  }
  function handleFinish() {
    let s = 0; questions.forEach(q => { if (submitted[q.id] && answers[q.id] === q.correct) s++ }); setScore(s)
  }
  function resetQuiz() { setAnswers({}); setSubmitted({}); setScore(null) }

  const cs = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s ease ${delay}s`,
  })

  return (
    <div className="min-h-screen bg-white">

      <section className="bg-navy-500 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#F59E0B', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono">
            <a href="/schedule" className="text-gold-400 hover:text-gold-300 transition-colors">Schedule</a>
            <span className="text-white/30">›</span>
            <span className="text-white/50">Control System Background</span>
          </div>
          <div className="flex items-center gap-3 mb-3" style={cs(0)}>
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-heading font-bold text-white text-sm shrink-0">W1</div>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-widest">Control Foundations - Jul 1</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2" style={cs(0.1)}>Control System Background</h1>
          <p className="text-white/60 text-sm max-w-xl" style={cs(0.2)}>System configurations, open-loop vs closed-loop, block diagrams, performance objectives, stability, and the design process.</p>
          <div className="flex items-center gap-3 mt-6" style={cs(0.3)}>
            <button onClick={() => setPdfOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white"><span>‹</span> Course Intro</button>
            <div className="flex-1" />
            <a href="/notes/modeling" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white">Mathematical Modeling <span>›</span></a>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* 1. DEFINITION */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.1)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">📘</span><h2 className="font-heading font-bold text-navy-500 text-lg">Control system definition</h2></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">A control system consists of <strong className="text-navy-500">subsystems</strong> and <strong className="text-navy-500">processes</strong> (or <strong className="text-navy-500">plants</strong>) assembled for the purpose of obtaining a <strong className="text-navy-500">desired output</strong> with desired <strong className="text-navy-500">performance</strong>, given a specified <strong className="text-navy-500">input</strong>.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4"><Fig1SimplifiedSystem /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ icon: '📥', label: 'Input r(t)', desc: 'The desired output value — what we want the system to achieve' },{ icon: '⚙️', label: 'Process G(s)', desc: 'The physical system being controlled — motor, furnace, elevator' },{ icon: '📤', label: 'Output y(t)', desc: 'What the system actually produces — position, temperature, speed' }].map((item, i) => (
              <div key={i} className="bg-navy-500/5 rounded-xl p-3 text-center hover:bg-navy-500/10 hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-heading font-bold text-navy-500 text-sm mb-1 font-mono">{item.label}</div>
                <div className="text-xs text-navy-300 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. ELEVATOR */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.13)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🛗</span><h2 className="font-heading font-bold text-navy-500 text-lg">Motivating example — the elevator</h2></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">When the 4th floor button is pressed from the 1st floor, the elevator rises with a speed and floor-leveling accuracy designed for passenger comfort. Two performance measures are immediately apparent:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 hover:bg-blue-100 transition-colors">
              <div className="font-heading font-bold text-blue-700 text-sm mb-1">Transient response</div>
              <div className="text-xs text-blue-600 leading-relaxed">How the elevator moves from floor 1 to floor 4. Too fast = discomfort. Too slow = impatience. Also has structural safety implications.</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 hover:bg-green-100 transition-colors">
              <div className="font-heading font-bold text-green-700 text-sm mb-1">Steady-state error</div>
              <div className="text-xs text-green-600 leading-relaxed">Whether the elevator levels exactly at the 4th floor. Poor leveling compromises passenger safety and convenience.</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4"><Fig2ElevatorResponse /></div>
        </div>

        {/* 3. WHY WE BUILD */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.16)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🏗</span><h2 className="font-heading font-bold text-navy-500 text-lg">Why we build control systems — 4 primary reasons</h2></div>
          <div className="space-y-3">
            {[
              { num: '1', title: 'Power amplification',           desc: 'A small input signal controls a large output force. The controller amplifies to drive a powerful actuator.',         example: 'Steering wheel input controls heavy hydraulic steering system' },
              { num: '2', title: 'Remote control',                desc: 'Control systems allow operation of plants from a distance without being physically present.',                        example: 'Spacecraft control from Earth, remote robotic surgery' },
              { num: '3', title: 'Convenience of input form',     desc: 'The input can be in a different physical form than the output, linked through transducers.',                         example: 'Dial position (mechanical) controls furnace valve (electrical)' },
              { num: '4', title: 'Compensation for disturbances', desc: 'Control systems automatically correct for unexpected disturbances — something open-loop systems cannot do.',          example: 'Cruise control maintaining speed on hills despite headwinds' },
            ].map((r, i) => (
              <div key={i} className="flex gap-4 p-4 glass rounded-xl hover:bg-navy-500/5 hover:-translate-x-0.5 transition-all duration-200 group">
                <div className="w-8 h-8 rounded-full bg-navy-500 text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-gold-500 group-hover:text-navy-500 transition-colors duration-200">{r.num}</div>
                <div>
                  <div className="font-heading font-bold text-navy-500 text-sm mb-0.5 group-hover:text-navy-600">{r.title}</div>
                  <div className="text-xs text-navy-400 leading-relaxed mb-1">{r.desc}</div>
                  <div className="text-xs text-gold-600 font-medium">Example: {r.example}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. OPEN LOOP */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.19)}>
          <div className="flex items-center gap-3 mb-2"><span className="text-2xl">🔓</span><h2 className="font-heading font-bold text-navy-500 text-lg">Open-loop systems</h2><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">No feedback</span></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">An open-loop system starts with an <strong className="text-navy-500">input transducer</strong> converting the input to the form used by the controller. The controller drives the plant. Disturbances cannot be detected or corrected.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4"><Fig3OpenLoop /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 border border-green-200 hover:bg-green-100 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-green-700 text-sm mb-2">Advantages</div>
              <ul className="space-y-1">{['Simple and inexpensive to build', 'Easy to design - no stability analysis needed', 'Works well when plant behavior is predictable'].map((p, i) => <li key={i} className="flex gap-2 items-start text-xs text-green-700"><span className="font-bold mt-0.5">+</span><span>{p}</span></li>)}</ul>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-200 hover:bg-red-100 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-red-700 text-sm mb-2">Disadvantages</div>
              <ul className="space-y-1">{['Cannot detect or correct disturbances', 'Sensitive to plant parameter changes', 'No accuracy guarantee on the output'].map((p, i) => <li key={i} className="flex gap-2 items-start text-xs text-red-700"><span className="font-bold mt-0.5">-</span><span>{p}</span></li>)}</ul>
            </div>
          </div>
        </div>

        {/* 5. CLOSED LOOP */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.22)}>
          <div className="flex items-center gap-3 mb-2"><span className="text-2xl">🔄</span><h2 className="font-heading font-bold text-navy-500 text-lg">Closed-loop (feedback) systems</h2><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">With feedback</span></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">An <strong className="text-navy-500">output transducer</strong> (sensor) measures the output and converts it to the form used by the controller. The system compares output to input — if there is any difference, the <strong className="text-navy-500">actuating signal</strong> drives the plant to correct it.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4"><Fig4ClosedLoop /></div>
          <div className="glass rounded-xl p-4 border-l-4 border-gold-500 mb-3 hover:bg-navy-500/5 transition-colors">
            <div className="font-heading font-bold text-navy-500 text-sm mb-1">The error signal</div>
            <div className="font-mono text-center text-xl font-bold text-gold-600 py-2">e(t) = r(t) - y(t)</div>
            <p className="text-xs text-navy-400 text-center">If e(t) is not zero, the system corrects. If e(t) = 0, no correction is needed.</p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-green-500 hover:bg-navy-500/5 transition-colors">
            <div className="font-heading font-bold text-navy-500 text-sm mb-2">Key advantages</div>
            <ul className="space-y-1.5">{['Greater accuracy than open-loop systems', 'Less sensitive to noise, disturbances, and environment changes', 'Transient response and steady-state error controlled more conveniently', 'Often improved by simple gain adjustment in the loop'].map((p, i) => <li key={i} className="flex gap-2 items-start text-xs text-navy-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" /><span>{p}</span></li>)}</ul>
          </div>
        </div>

        {/* 6. COMPARISON */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.25)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">📊</span><h2 className="font-heading font-bold text-navy-500 text-lg">Response comparison</h2></div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4"><ComparisonSVG /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3 hover:bg-navy-500/8 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-navy-500 mb-2 text-sm">Closed-loop transfer function</div>
              <div className="font-mono text-center text-sm font-bold text-gold-600 py-1">Y/R = G / (1 + GH)</div>
              <p className="text-xs text-navy-300 mt-1 text-center">G = forward gain, H = feedback gain</p>
            </div>
            <div className="glass rounded-xl p-3 hover:bg-navy-500/8 hover:-translate-y-0.5 transition-all duration-200">
              <div className="font-heading font-semibold text-navy-500 mb-2 text-sm">Open-loop transfer function</div>
              <div className="font-mono text-center text-sm font-bold text-gold-600 py-1">Y/R = G</div>
              <p className="text-xs text-navy-300 mt-1 text-center">No feedback — forward path only</p>
            </div>
          </div>
        </div>

        {/* 7. TRANSFER FUNCTION */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.27)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">📐</span><h2 className="font-heading font-bold text-navy-500 text-lg">Deriving the closed-loop transfer function</h2></div>
          <div className="space-y-3">
            {[{ n: '1', title: 'Error definition', eq: 'E(s) = R(s) - Y(s)', note: 'summing junction' },{ n: '2', title: 'Controller output', eq: 'U(s) = G(s) . E(s)', note: 'forward path' },{ n: '3', title: 'Substitute E(s)', eq: 'Y(s) = G(s) . [R(s) - Y(s)]', note: 'combine' }].map((step, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5 hover:bg-gray-100 transition-colors">
                <div className="w-6 h-6 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{step.n}</div>
                <span className="text-xs text-navy-300 w-32 shrink-0">{step.title}</span>
                <span className="font-mono text-sm text-gold-600 flex-1">{step.eq}</span>
                <span className="text-xs text-navy-300 italic hidden sm:block">{step.note}</span>
              </div>
            ))}
            <div className="rounded-xl p-4 bg-navy-500 hover:bg-navy-400 transition-colors duration-200">
              <div className="font-mono text-center py-2">
                <div className="text-white/50 text-xs mb-1">Y(s) + G(s).Y(s) = G(s).R(s)</div>
                <div className="text-white/50 text-xs mb-3">Y(s)[1 + G(s)] = G(s).R(s)</div>
                <div className="text-gold-400 text-2xl font-bold">Y(s)/R(s) = G(s) / [1 + G(s)]</div>
              </div>
              <p className="text-xs text-white/50 text-center mt-1">With sensor H(s): Y/R = G / (1 + GH)</p>
            </div>
            <div className="glass rounded-xl p-4 border-l-4 border-gold-500 hover:bg-navy-500/5 transition-colors">
              <div className="font-heading font-bold text-navy-500 text-sm mb-1">Why does the denominator become 1 + G?</div>
              <p className="text-xs text-navy-400 leading-relaxed">The feedback loop means every signal traveling around the loop gets multiplied by G(s). The term (1 + G) accounts for this loop gain. When 1 + G = 0, the closed-loop poles are defined — this is the root of stability analysis.</p>
            </div>
          </div>
        </div>

        {/* 8. ANALYSIS OBJECTIVES */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.29)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🏆</span><h2 className="font-heading font-bold text-navy-500 text-lg">Analysis and design objectives</h2></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">Every control system must meet three core objectives. Stability must be achieved first before the others can be designed.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {performanceGoals.map((g, i) => (
              <div key={i} className={'rounded-xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default ' + colorMap[g.color]}>
                <div className="flex items-center gap-2 mb-2"><span className="text-xl">{g.icon}</span><span className="font-heading font-bold text-sm">{g.title}</span></div>
                <p className="text-xs leading-relaxed opacity-80">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 9. STABILITY */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.31)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">⚖️</span><h2 className="font-heading font-bold text-navy-500 text-lg">Stability — the fundamental requirement</h2></div>
          <div className="glass rounded-xl p-4 border-l-4 border-navy-500 mb-4 hover:bg-navy-500/5 transition-colors">
            <div className="font-mono text-center text-lg font-bold text-gold-600 py-2">Total Response = Natural Response + Forced Response</div>
            <p className="text-xs text-navy-300 text-center">Natural response depends on the system. Forced response depends on the input.</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4"><StabilitySVG /></div>
          <div className="space-y-2">
            {[{ label: 'Stable', color: 'text-green-600', desc: 'Natural response decays to zero as time approaches infinity. Transient response dies out, leaving only the forced response.' },{ label: 'Marginally stable', color: 'text-amber-600', desc: 'Natural response oscillates indefinitely. The system neither settles nor blows up. Often considered undesirable in practice.' },{ label: 'Unstable', color: 'text-red-600', desc: 'Natural response grows without bound. The system is no longer controlled and may self-destruct.' }].map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 transition-colors">
                <span className={'font-heading font-bold text-sm w-32 shrink-0 ' + s.color}>{s.label}</span>
                <span className="text-xs text-navy-400 leading-relaxed">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 10. DESIGN PROCESS */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.33)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🔧</span><h2 className="font-heading font-bold text-navy-500 text-lg">The design process</h2></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">Designing a feedback control system follows an orderly sequence. The process is iterative — if performance is not met, the designer returns to an earlier step.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4"><Fig5DesignProcess /></div>
          <div className="glass rounded-xl p-4 border-l-4 border-gold-500 hover:bg-navy-500/5 transition-colors">
            <div className="font-heading font-bold text-navy-500 text-sm mb-1">Why is the process iterative?</div>
            <p className="text-xs text-navy-400 leading-relaxed">Real systems rarely work perfectly on the first design attempt. Simulation may reveal stability issues; hardware testing may reveal modeling errors. Each iteration improves the design until all specifications are met.</p>
          </div>
        </div>

        {/* 11. SIGNAL FLOW */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.35)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🔀</span><h2 className="font-heading font-bold text-navy-500 text-lg">Signal flow concepts</h2></div>
          <div className="space-y-2">
            {[{ name: 'Forward path', desc: 'The path from input r(t) through the controller and plant to the output y(t). Gain = G(s).' },{ name: 'Feedback path', desc: 'The path from output back through the sensor to the summing junction. Gain = H(s).' },{ name: 'Loop gain', desc: 'The total gain around the feedback loop: G(s).H(s). Determines stability behavior.' },{ name: 'Disturbance', desc: 'An unwanted signal entering the plant. Closed-loop systems reject disturbances automatically.' },{ name: 'Summing junction', desc: 'The point where reference and feedback signals combine to produce the error signal.' }].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 hover:-translate-x-0.5 transition-all duration-200 group">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0 mt-2" />
                <div><span className="font-heading font-bold text-gold-600 text-sm group-hover:text-gold-700 transition-colors">{item.name}: </span><span className="text-sm text-navy-400 leading-relaxed">{item.desc}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* 12. EXAMPLES */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.37)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🌍</span><h2 className="font-heading font-bold text-navy-500 text-lg">Real-world examples</h2></div>
          <div className="space-y-3">
            {examples.map((ex, i) => (
              <div key={i} className="glass rounded-xl p-4 hover:bg-navy-500/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-center gap-2 mb-2"><span className="text-xl">{ex.icon}</span><span className="font-heading font-bold text-navy-500 text-sm group-hover:text-navy-600 transition-colors">{ex.title}</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-red-50 rounded-lg p-2 border border-red-100 hover:bg-red-100 transition-colors"><div className="text-xs font-bold text-red-600 mb-1">Open-loop version</div><div className="text-xs text-red-700 leading-relaxed">{ex.open}</div></div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-100 hover:bg-green-100 transition-colors"><div className="text-xs font-bold text-green-600 mb-1">Closed-loop version</div><div className="text-xs text-green-700 leading-relaxed">{ex.closed}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 13. KEY TERMS */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.39)}>
          <div className="flex items-center gap-3 mb-4"><span className="text-2xl">📖</span><h2 className="font-heading font-bold text-navy-500 text-lg">Key terms</h2></div>
          <div className="space-y-2">
            {keyTerms.map((t, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 hover:-translate-x-0.5 transition-all duration-200 group">
                <span className="font-heading font-bold text-gold-600 text-sm w-36 shrink-0 group-hover:text-gold-700 transition-colors">{t.term}</span>
                <span className="text-sm text-navy-400 leading-relaxed">{t.def}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 14. QUIZ */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.41)}>
          <div className="flex items-center gap-3 mb-3"><span className="text-2xl">🧠</span><h2 className="font-heading font-bold text-navy-500 text-lg">Test your understanding</h2></div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">15 multiple choice questions covering the definition, configurations, performance objectives, stability, and the design process.</p>
          <button onClick={() => setQuizOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-500 text-white font-semibold text-sm hover:bg-navy-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            Start quiz
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        {/* 15. NEXT */}
        <div className="rounded-2xl p-6 bg-navy-500 text-white relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style={cs(0.43)}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: '#F59E0B', filter: 'blur(40px)', transform: 'translate(20%,-20%)' }} />
          <p className="text-xs text-gold-400 font-semibold uppercase tracking-widest mb-2">Coming up next</p>
          <h3 className="font-heading font-bold text-xl mb-1">Mathematical Modeling</h3>
          <p className="text-white/60 text-sm mb-5">Newton laws applied to mechanical systems. Free body diagrams and equations of motion for spring-mass-damper systems.</p>
          <a href="/notes/modeling" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            Open notes
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

      </div>

      {/* PDF MODAL */}
      {pdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,42,74,0.75)', backdropFilter: 'blur(6px)' }} onClick={() => setPdfOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col" style={{ height: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">PDF</div>
              <div className="flex-1 min-w-0"><div className="font-heading font-bold text-white text-sm">Course Syllabus</div><div className="text-xs text-white/50 font-mono">MEEN 424 - Summer II 2026</div></div>
              <a href="/Syllabus.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors shrink-0">Download</a>
              <button onClick={() => setPdfOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors shrink-0 text-sm font-bold">X</button>
            </div>
            <div className="flex-1 bg-gray-100"><iframe src="/Syllabus.pdf" className="w-full h-full" title="MEEN 424 Syllabus" style={{ border: 'none' }} /></div>
          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(11,42,74,0.80)', backdropFilter: 'blur(8px)' }} onClick={() => setQuizOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col" style={{ height: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">Q</div>
              <div className="flex-1"><div className="font-heading font-bold text-white text-sm">Control System Background - Quiz</div><div className="text-xs text-white/50">{questions.length} multiple choice questions</div></div>
              {score !== null && <div className="px-3 py-1 rounded-lg bg-gold-500 text-navy-500 font-bold text-sm">{score}/{questions.length}</div>}
              <button onClick={() => { setQuizOpen(false); resetQuiz() }} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors text-sm font-bold shrink-0">X</button>
            </div>
            {score !== null && (
              <div className={'px-5 py-3 text-sm font-semibold flex items-center gap-2 shrink-0 ' + (score >= 12 ? 'bg-green-50 text-green-700' : score >= 8 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')}>
                <span className="text-lg">{score >= 12 ? '🎉' : score >= 8 ? '👍' : '📚'}</span>
                {score >= 12 ? 'Excellent! Strong grasp of control system fundamentals.' : score >= 8 ? 'Good effort! Review the sections you missed.' : 'Keep studying - revisit the notes and try again.'}
                <button onClick={resetQuiz} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Retake</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {questions.map(q => {
                const isSubmitted = submitted[q.id], userAns = answers[q.id] || '', isCorrect = userAns === q.correct
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
                        return <button key={oi} onClick={() => handleMC(q.id, opt)} className={'w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all duration-200 ' + optStyle} disabled={isSubmitted}><span className="font-mono font-bold mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>{opt}</button>
                      })}
                      {isSubmitted && <p className={'text-xs mt-1 font-medium ' + (isCorrect ? 'text-green-600' : 'text-red-500')}>{isCorrect ? 'Correct!' : 'Incorrect - correct answer highlighted in green.'}</p>}
                    </div>
                  </div>
                )
              })}
              {score === null && (
                <button onClick={handleFinish} className="w-full py-3 rounded-xl bg-gold-500 text-navy-500 font-heading font-bold text-sm hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">Finish and see score</button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
