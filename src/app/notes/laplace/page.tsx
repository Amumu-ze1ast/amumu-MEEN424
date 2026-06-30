'use client'
import { useState, useEffect } from 'react'

// ── DATA ──────────────────────────────────────────────────────────
const keyTerms = [
  { term: 'Laplace Transform',    def: 'Converts a time-domain function f(t) into a complex frequency-domain function F(s) via the integral definition.' },
  { term: 'Complex Variable s',   def: 's = σ + jω, where σ is the real part and ω is the imaginary part. Represents complex frequency.' },
  { term: 'Inverse Laplace',      def: 'The operation L⁻¹{F(s)} = f(t) that recovers the time-domain signal from F(s).' },
  { term: 'Transfer Function',    def: 'The Laplace-domain ratio of output to input: G(s) = Y(s)/U(s) for a system at rest.' },
  { term: 'Linearity',            def: 'L{af(t) + bg(t)} = aF(s) + bG(s). Transforms scale and add just like the original functions.' },
  { term: 'Frequency Shift',      def: 'L{e^(at)f(t)} = F(s-a). Multiplying by an exponential shifts the transform in s.' },
  { term: 'Time Scaling',         def: 'L{f(ct)} = (1/c)F(s/c). Compressing time expands the s-domain.' },
  { term: 'Differentiation',      def: 'L{f\'(t)} = sF(s) - f(0). Differentiation in time becomes multiplication by s.' },
  { term: 'Integration',          def: 'L{∫₀ᵗ f(v)dv} = F(s)/s. Integration in time becomes division by s.' },
  { term: 'Unit Step u(t)',        def: 'u(t) = 0 for t < 0, u(t) = 1 for t ≥ 0. Laplace transform is 1/s.' },
  { term: 'Dirac Delta δ(t)',     def: 'An ideal unit impulse at t = 0. Laplace transform is 1.' },
  { term: 'Convolution',          def: 'L{∫₀ᵗ f(t−τ)g(τ)dτ} = F(s)G(s). Convolution in time = multiplication in s.' },
  { term: 'Region of Convergence',def: 'The set of s values for which the Laplace integral converges, e.g. Re(s) > a for e^(at).' },
]

const laplaceTable = [
  { n:'1',  ft:'1',                     Fs:'1/s' },
  { n:'2',  ft:'eᵃᵗ',                  Fs:'1/(s−a)' },
  { n:'3',  ft:'tⁿ, n=1,2,3,…',        Fs:'n!/sⁿ⁺¹' },
  { n:'4',  ft:'tᵖ, p>−1',             Fs:'Γ(p+1)/sᵖ⁺¹' },
  { n:'5',  ft:'√t',                    Fs:'√π / (2s^(3/2))' },
  { n:'6',  ft:'tⁿ⁻½, n=1,2,3,…',     Fs:'1·3·5···(2n−1)√π / (2ⁿ·sⁿ⁺½)' },
  { n:'7',  ft:'sin(at)',               Fs:'a/(s²+a²)' },
  { n:'8',  ft:'cos(at)',               Fs:'s/(s²+a²)' },
  { n:'9',  ft:'t sin(at)',             Fs:'2as/(s²+a²)²' },
  { n:'10', ft:'t cos(at)',             Fs:'(s²−a²)/(s²+a²)²' },
  { n:'11', ft:'sin(at) − at cos(at)', Fs:'2a³/(s²+a²)²' },
  { n:'12', ft:'sin(at) + at cos(at)', Fs:'2as²/(s²+a²)²' },
  { n:'13', ft:'cos(at) − at sin(at)', Fs:'s(s²−a²)/(s²+a²)²' },
  { n:'14', ft:'cos(at) + at sin(at)', Fs:'s(s²+3a²)/(s²+a²)²' },
  { n:'15', ft:'sin(at+b)',             Fs:'[s sin(b)+a cos(b)]/(s²+a²)' },
  { n:'16', ft:'cos(at+b)',             Fs:'[s cos(b)−a sin(b)]/(s²+a²)' },
  { n:'17', ft:'sinh(at)',              Fs:'a/(s²−a²)' },
  { n:'18', ft:'cosh(at)',              Fs:'s/(s²−a²)' },
  { n:'19', ft:'eᵃᵗ sin(bt)',          Fs:'b/[(s−a)²+b²]' },
  { n:'20', ft:'eᵃᵗ cos(bt)',          Fs:'(s−a)/[(s−a)²+b²]' },
  { n:'21', ft:'eᵃᵗ sinh(bt)',         Fs:'b/[(s−a)²−b²]' },
  { n:'22', ft:'eᵃᵗ cosh(bt)',         Fs:'(s−a)/[(s−a)²−b²]' },
  { n:'23', ft:'tⁿeᵃᵗ, n=1,2,3,…',   Fs:'n!/(s−a)ⁿ⁺¹' },
  { n:'24', ft:'f(ct)',                 Fs:'(1/c)F(s/c)' },
  { n:'25', ft:'uₓ(t)=u(t−c)  [Heaviside]', Fs:'e⁻ᶜˢ/s' },
  { n:'26', ft:'δ(t−c)  [Dirac Delta]',      Fs:'e⁻ᶜˢ' },
  { n:'27', ft:'uₓ(t)f(t−c)',          Fs:'e⁻ᶜˢF(s)' },
  { n:'28', ft:'uₓ(t)g(t)',            Fs:'e⁻ᶜˢ L{g(t+c)}' },
  { n:'29', ft:'eᶜᵗf(t)',              Fs:'F(s−c)' },
  { n:'30', ft:'tⁿf(t), n=1,2,3,…',  Fs:'(−1)ⁿ F⁽ⁿ⁾(s)' },
  { n:'31', ft:'(1/t)f(t)',            Fs:'∫ₛ^∞ F(u)du' },
  { n:'32', ft:'∫₀ᵗ f(v)dv',          Fs:'F(s)/s' },
  { n:'33', ft:'∫₀ᵗ f(t−τ)g(τ)dτ',   Fs:'F(s)G(s)' },
  { n:'34', ft:'f(t+T)=f(t)  [periodic]', Fs:'[∫₀ᵀ e⁻ˢᵗf(t)dt] / (1−e⁻ˢᵀ)' },
  { n:'35', ft:"f'(t)",               Fs:'sF(s) − f(0)' },
  { n:'36', ft:'f″(t)',               Fs:'s²F(s) − sf(0) − f\'(0)' },
  { n:'37', ft:'f⁽ⁿ⁾(t)',            Fs:'sⁿF(s) − sⁿ⁻¹f(0) − ··· − f⁽ⁿ⁻¹⁾(0)' },
]

const questions = [
  { id:1,  q:'The Laplace transform is defined as:', options:['F(s) = ∫₀^∞ f(t)eˢᵗ dt','F(s) = ∫₀^∞ f(t)e⁻ˢᵗ dt','F(s) = ∫₋∞^∞ f(t)e⁻ˢᵗ dt','F(s) = ∫₀^∞ f(s)e⁻ˢᵗ ds'], correct:'F(s) = ∫₀^∞ f(t)e⁻ˢᵗ dt' },
  { id:2,  q:'The Laplace transform of eᵃᵗ is:', options:['1/(s+a)','1/(s−a)','a/(s²+a²)','s/(s²+a²)'], correct:'1/(s−a)' },
  { id:3,  q:'The Laplace transform of e⁻ᵃᵗu(t) is:', options:['1/(s−a)','a/(s+a)','1/(s+a)','s/(s+a)'], correct:'1/(s+a)' },
  { id:4,  q:'The Laplace transform of sin(at) is:', options:['s/(s²+a²)','a/(s²−a²)','a/(s²+a²)','s/(s²−a²)'], correct:'a/(s²+a²)' },
  { id:5,  q:'The Laplace transform of cos(at) is:', options:['a/(s²+a²)','s/(s²−a²)','a/(s²−a²)','s/(s²+a²)'], correct:'s/(s²+a²)' },
  { id:6,  q:'The linearity property of the Laplace transform states:', options:['L{f·g} = F(s)·G(s)','L{af+bg} = aF(s)+bG(s)','L{f/g} = F(s)/G(s)','L{f+g} = F(s)·G(s)'], correct:'L{af+bg} = aF(s)+bG(s)' },
  { id:7,  q:"The differentiation property L{f'(t)} equals:", options:['F(s)/s','sF(s) + f(0)','sF(s) − f(0)','s²F(s) − f(0)'], correct:'sF(s) − f(0)' },
  { id:8,  q:'Table entry #30 states L{tⁿf(t)} equals:', options:['(−1)ⁿ F⁽ⁿ⁾(s)','nF(s)/s','F(s−n)','(−1)ⁿ sⁿF(s)'], correct:'(−1)ⁿ F⁽ⁿ⁾(s)' },
  { id:9,  q:'The Laplace transform of ∫₀ᵗ f(v)dv is:', options:['sF(s)','F(s)/s','F(s)−f(0)','F(s)·s'], correct:'F(s)/s' },
  { id:10, q:'The frequency shift property states L{eᶜᵗf(t)} equals:', options:['F(s+c)','F(s·c)','F(s−c)','cF(s)'], correct:'F(s−c)' },
]

// ── SVG COMPONENTS ────────────────────────────────────────────────

function SVGDefinition() {
  return (
    // <svg viewBox="0 0 640 145" className="w-full" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
     <svg viewBox="0 0 640 145" className="w-full"
        style={{  fontFamily: 'JetBrains Mono, monospace' }}> 
      <style>{`
        @keyframes flowDot { 0%{transform:translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(360px);opacity:0} }
        @keyframes fadeInSVG { from{opacity:0} to{opacity:1} }
        .flowDot { animation: flowDot 2.8s ease-in-out infinite; }
        .fadeL { opacity:0; animation: fadeInSVG 0.6s ease 0.3s forwards; }
        .fadeM { opacity:0; animation: fadeInSVG 0.6s ease 0.8s forwards; }
        .fadeR { opacity:0; animation: fadeInSVG 0.6s ease 1.3s forwards; }
      `}</style>

      {/* f(t) block — centered vertically in the SVG */}
      <g className="fadeL">
        <rect x="20" y="48" width="110" height="44" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5"/>
        <text x="75" y="67" textAnchor="middle" fontSize="13" fill="#0B2A4A" fontWeight="600">f(t)</text>
        <text x="75" y="83" textAnchor="middle" fontSize="10" fill="#64748b">time domain</text>
      </g>

      {/* Arrow left */}
      <line x1="130" y1="70" x2="200" y2="70" stroke="#F59E0B" strokeWidth="2" className="fadeL"/>
      <polygon points="197,65 203,70 197,75" fill="#F59E0B" className="fadeL"/>

      {/* Integral block — tall enough to contain big integral with limits */}
      <g className="fadeM">
        <rect x="200" y="10" width="240" height="110" rx="8" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.5"/>
        {/* Title */}
        <text x="320" y="32" textAnchor="middle" fontSize="11" fill="white" fontWeight="600">Laplace Transform</text>
        {/* Large integral symbol — baseline at y=90 */}
        <text x="250" y="92" fontSize="48" fill="#F59E0B" fontWeight="300">&#x222B;</text>
        {/* Upper limit ∞ — shifted right to sit above right side of ∫ */}
        <text x="275" y="60" fontSize="11" fill="#F59E0B" fontWeight="700">&#x221E;</text>
        {/* Lower limit 0⁻ — stays below left side of ∫ */}
        <text x="260" y="113" fontSize="11" fill="#F59E0B" fontWeight="700">0&#x207B;</text>
        {/* f(t) — moved left, tighter spacing */}
        <text x="270" y="80" fontSize="14" fill="#F59E0B" fontWeight="700">f(t)</text>
        {/* e base — immediately after f(t) */}
        <text x="305" y="80" fontSize="14" fill="#F59E0B" fontWeight="700">e</text>
        {/* −st superscript — tight above e */}
        <text x="310" y="73" fontSize="10" fill="#F59E0B" fontWeight="700">&#x2212;st</text>
        {/* dt — immediately after superscript width */}
        <text x="330" y="80" fontSize="14" fill="#F59E0B" fontWeight="700">dt</text>
        {/* s description */}
        <text x="320" y="112" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">s = σ + jω</text>
      </g>

      {/* Arrow right */}
      <line x1="440" y1="70" x2="510" y2="70" stroke="#F59E0B" strokeWidth="2" className="fadeM"/>
      <polygon points="507,65 513,70 507,75" fill="#F59E0B" className="fadeM"/>

      {/* F(s) block */}
      <g className="fadeR">
        <rect x="510" y="48" width="110" height="44" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5"/>
        <text x="565" y="67" textAnchor="middle" fontSize="13" fill="#0B2A4A" fontWeight="600">F(s)</text>
        <text x="565" y="83" textAnchor="middle" fontSize="10" fill="#64748b">s-domain</text>
      </g>

      {/* Traveling dot */}
      <circle className="flowDot" cx="130" cy="70" r="6" fill="#F59E0B"/>

      {/* Caption */}
      <text x="320" y="136" textAnchor="middle" fontSize="11" fill="#64748b">Figure 1: The Laplace transform maps f(t) to F(s) — differential equations become algebra</text>
    </svg>
  )
}

function SVGProperties() {
  const props = [
    { label:'1. Linearity',        top:'L{af + bg}',   bot:'aF(s) + bG(s)',       color:'#3b82f6' },
    { label:'2. Differentiation',  top:"L{f'(t)}",     bot:'sF(s) − f(0)',        color:'#10b981' },
    { label:'3. Multiply by t',    top:'L{t·f(t)}',    bot:"−F'(s)",              color:'#F59E0B' },
    { label:'4. Integration',      top:'L{∫₀ᵗ f(v)dv}',bot:'F(s) / s',           color:'#8b5cf6' },
    { label:'5. Frequency Shift',  top:'L{e^(ct)·f(t)}',bot:'F(s − c)',           color:'#ef4444' },
    { label:'6. Time Scaling',     top:'L{f(ct)}',     bot:'(1/c) · F(s/c)',      color:'#0891b2' },
  ]
  const rh = 64, gap = 10, totalH = props.length * (rh + gap) + 20
  return (
    <svg viewBox={`0 0 520 ${totalH}`} className="w-full max-w-lg mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .pp0{animation:slideIn 0.35s ease 0.05s both}
        .pp1{animation:slideIn 0.35s ease 0.15s both}
        .pp2{animation:slideIn 0.35s ease 0.25s both}
        .pp3{animation:slideIn 0.35s ease 0.35s both}
        .pp4{animation:slideIn 0.35s ease 0.45s both}
        .pp5{animation:slideIn 0.35s ease 0.55s both}
      `}</style>
      {props.map((p, i) => {
        const y = 8 + i * (rh + gap)
        const cy = y + rh / 2
        return (
          <g key={i} className={`pp${i}`}>
            {/* Background */}
            <rect x="4" y={y} width="512" height={rh} rx="8"
              fill={p.color + '12'} stroke={p.color} strokeWidth="1.5"/>
            {/* Label badge */}
            <rect x="12" y={y + 12} width="160" height="20" rx="5" fill={p.color + '25'}/>
            <text x="92" y={y + 26} textAnchor="middle" fontSize="10" fill={p.color} fontWeight="700">{p.label}</text>
            {/* Equals sign */}
            <text x="198" y={cy + 4} fontSize="14" fill="#94a3b8" fontWeight="600">=</text>
            {/* Left side (top of fraction = function) */}
            <text x="182" y={cy - 4} fontSize="11" fill="#0B2A4A" fontWeight="600">{p.top}</text>
            {/* Fraction line */}
            <line x1="212" y1={cy + 6} x2="500" y2={cy + 6} stroke={p.color} strokeWidth="0.8" strokeDasharray="4,3"/>
            {/* Right side (result) */}
            <text x="356" y={cy + 20} textAnchor="middle" fontSize="12" fill={p.color} fontWeight="700">{p.bot}</text>
          </g>
        )
      })}
    </svg>
  )
}

function SVGEatDerivation() {
  return (
    <svg viewBox="0 0 620 220" className="w-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      <style>{`
        @keyframes drawLine { to{stroke-dashoffset:0} }
        @keyframes fadeSVG { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .s0{animation:fadeSVG 0.4s ease 0.1s both}
        .s1{animation:fadeSVG 0.4s ease 0.5s both}
        .s2{animation:fadeSVG 0.4s ease 0.9s both}
        .s3{animation:fadeSVG 0.4s ease 1.3s both}
        .arr{stroke-dasharray:300;stroke-dashoffset:300;animation:drawLine 0.6s ease 0.4s forwards}
      `}</style>

      {/* Step 0: Apply definition */}
      <g className="s0">
        <rect x="20" y="8" width="580" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2"/>
        <text x="36" y="22" fontSize="9" fill="#64748b">Apply definition</text>
        {/* L{e^(at)} = ∫₀^∞ e^(-st) · e^(at) dt */}
        <text x="36" y="38" fontSize="11" fill="#0B2A4A" fontWeight="500">L&#123;e</text>
        <text x="55" y="31" fontSize="8" fill="#0B2A4A">at</text>
        <text x="63" y="38" fontSize="11" fill="#0B2A4A" fontWeight="500">&#125; =</text>
        {/* integral */}
        <text x="88" y="42" fontSize="20" fill="#0B2A4A" fontWeight="300">&#x222B;</text>
        <text x="100" y="28" fontSize="8" fill="#0B2A4A">&#x221E;</text>
        <text x="97" y="47" fontSize="8" fill="#0B2A4A">0</text>
        <text x="108" y="38" fontSize="11" fill="#0B2A4A" fontWeight="500"> e</text>
        <text x="120" y="31" fontSize="8" fill="#0B2A4A">&#x2212;st</text>
        <text x="135" y="38" fontSize="11" fill="#0B2A4A" fontWeight="500"> · e</text>
        <text x="155" y="31" fontSize="8" fill="#0B2A4A">at</text>
        <text x="163" y="38" fontSize="11" fill="#0B2A4A" fontWeight="500"> dt</text>
        <line x1="310" y1="46" x2="310" y2="58" stroke="#F59E0B" strokeWidth="1.5" className="arr"/>
      </g>

      {/* Step 1: Combine exponents */}
      <g className="s1">
        <rect x="20" y="60" width="580" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2"/>
        <text x="36" y="74" fontSize="9" fill="#64748b">Combine exponents</text>
        <text x="36" y="90" fontSize="11" fill="#0B2A4A" fontWeight="500">=</text>
        <text x="50" y="94" fontSize="20" fill="#0B2A4A" fontWeight="300">&#x222B;</text>
        <text x="62" y="80" fontSize="8" fill="#0B2A4A">&#x221E;</text>
        <text x="59" y="99" fontSize="8" fill="#0B2A4A">0</text>
        <text x="70" y="90" fontSize="11" fill="#0B2A4A" fontWeight="500"> e</text>
        <text x="80" y="83" fontSize="8" fill="#0B2A4A">(a&#x2212;s)t</text>
        <text x="113" y="90" fontSize="11" fill="#0B2A4A" fontWeight="500"> dt</text>
        <line x1="310" y1="98" x2="310" y2="110" stroke="#F59E0B" strokeWidth="1.5" className="arr"/>
      </g>

      {/* Step 2: Evaluate */}
      <g className="s2">
        <rect x="20" y="112" width="580" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2"/>
        <text x="36" y="126" fontSize="9" fill="#64748b">Evaluate (need s &gt; a)</text>
        {/* = [ e^(a-s)t / (a-s) ] from 0 to ∞ — using fraction */}
        <text x="36" y="143" fontSize="11" fill="#0B2A4A" fontWeight="500">= [  e</text>
        <text x="66" y="136" fontSize="8" fill="#0B2A4A">(a&#x2212;s)t</text>
        {/* fraction line */}
        <line x1="95" y1="140" x2="120" y2="140" stroke="#0B2A4A" strokeWidth="1"/>
        <text x="98" y="137" fontSize="8" fill="#0B2A4A">1</text>
        <text x="96" y="148" fontSize="8" fill="#0B2A4A">a&#x2212;s</text>
        <text x="122" y="143" fontSize="11" fill="#0B2A4A" fontWeight="500"> ]</text>
        <text x="134" y="136" fontSize="8" fill="#0B2A4A">&#x221E;</text>
        <text x="134" y="148" fontSize="8" fill="#0B2A4A">0</text>
        <line x1="310" y1="150" x2="310" y2="162" stroke="#F59E0B" strokeWidth="1.5" className="arr"/>
      </g>

      {/* Step 3: Apply limits — final result */}
      <g className="s3">
        <rect x="20" y="164" width="580" height="38" rx="6" fill="#0B2A4A" stroke="#0B2A4A" strokeWidth="1.2"/>
        <text x="36" y="178" fontSize="9" fill="rgba(255,255,255,0.5)">Apply limits (→ 0 at ∞,  1 at 0)</text>
        {/* = 0 - 1/(a-s) = 1/(s-a) as fractions */}
        <text x="36" y="195" fontSize="11" fill="#F59E0B" fontWeight="700">= 0 &#x2212;</text>
        {/* fraction 1/(a-s) */}
        <line x1="80" y1="190" x2="105" y2="190" stroke="#F59E0B" strokeWidth="1.2"/>
        <text x="88" y="187" fontSize="9" fill="#F59E0B" fontWeight="700">1</text>
        <text x="81" y="198" fontSize="9" fill="#F59E0B" fontWeight="700">a&#x2212;s</text>
        <text x="108" y="195" fontSize="11" fill="#F59E0B" fontWeight="700">  =</text>
        {/* fraction 1/(s-a) */}
        <line x1="128" y1="190" x2="153" y2="190" stroke="#F59E0B" strokeWidth="1.2"/>
        <text x="136" y="187" fontSize="9" fill="#F59E0B" fontWeight="700">1</text>
        <text x="129" y="198" fontSize="9" fill="#F59E0B" fontWeight="700">s&#x2212;a</text>
      </g>

      <text x="310" y="215" textAnchor="middle" fontSize="10" fill="#64748b">Figure 2: Step-by-step derivation of L&#123;eᵃᵗ&#125; = 1/(s−a)</text>
    </svg>
  )
}

function SVGStabilityRegion() {
  return (
    <svg viewBox="0 0 440 220" className="w-full max-w-lg mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes fadeIn2 { from{opacity:0} to{opacity:1} }
        .r1{animation:fadeIn2 0.5s ease 0.2s both}
        .r2{animation:fadeIn2 0.5s ease 0.6s both}
        .r3{animation:fadeIn2 0.5s ease 1s both}
      `}</style>
      {/* Stable region */}
      <rect x="20" y="10" width="195" height="195" rx="0" fill="rgba(16,185,129,0.08)" className="r1"/>
      {/* Unstable region */}
      <rect x="220" y="10" width="200" height="195" rx="0" fill="rgba(239,68,68,0.08)" className="r3"/>
      {/* Axes */}
      <line x1="218" y1="10" x2="218" y2="205" stroke="#cbd5e1" strokeWidth="1.5"/>
      <line x1="20"  y1="107" x2="420" y2="107" stroke="#cbd5e1" strokeWidth="1.5"/>
      <polygon points="215,12 218,6 221,12" fill="#cbd5e1"/>
      <polygon points="417,104 423,107 417,110" fill="#cbd5e1"/>
      <text x="426" y="111" fontSize="11" fill="#64748b">σ</text>
      <text x="222" y="10"  fontSize="11" fill="#64748b">jω</text>

      {/* Stable label */}
      <text x="110" y="38" textAnchor="middle" fontSize="12" fill="#10b981" fontWeight="700" className="r1">STABLE</text>
      <text x="110" y="53" textAnchor="middle" fontSize="9"  fill="#10b981" className="r1">Re(s) &lt; 0</text>
      <text x="110" y="65" textAnchor="middle" fontSize="9"  fill="#10b981" className="r1">poles decay to zero</text>

      {/* Imaginary axis label */}
      <text x="218" y="38" textAnchor="middle" fontSize="9" fill="#F59E0B" fontWeight="700" className="r2">jω axis</text>
      <text x="218" y="50" textAnchor="middle" fontSize="8" fill="#F59E0B" className="r2">marginal</text>

      {/* Unstable label */}
      <text x="320" y="38" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="700" className="r3">UNSTABLE</text>
      <text x="320" y="53" textAnchor="middle" fontSize="9"  fill="#ef4444" className="r3">Re(s) &gt; 0</text>
      <text x="320" y="65" textAnchor="middle" fontSize="9"  fill="#ef4444" className="r3">poles grow unbounded</text>

      {/* Stable poles — left half, with labels well clear of dots */}
      <circle cx="100" cy="80"  r="6" fill="#10b981" className="r1"/>
      <text x="112" y="77"  fontSize="9" fill="#10b981" className="r1">s₁ (stable)</text>
      <circle cx="100" cy="134" r="6" fill="#10b981" className="r1"/>
      <text x="112" y="131" fontSize="9" fill="#10b981" className="r1">s₁* (conjugate)</text>

      {/* Marginal poles — on imaginary axis */}
      <circle cx="218" cy="78"  r="6" fill="#F59E0B" stroke="#F59E0B" className="r2"/>
      <circle cx="218" cy="136" r="6" fill="#F59E0B" stroke="#F59E0B" className="r2"/>

      {/* Unstable pole — right half */}
      <circle cx="320" cy="107" r="6" fill="#ef4444" className="r3"/>
      <text x="332" y="104" fontSize="9" fill="#ef4444" className="r3">s (unstable)</text>

      <text x="220" y="215" textAnchor="middle" fontSize="10" fill="#64748b">Figure 3: Pole locations in the s-plane determine system stability</text>
    </svg>
  )
}

// ── COLLAPSIBLE COMPONENT ─────────────────────────────────────────
function Collapsible({ label, children, accent = 'gold' }: { label: string; children: React.ReactNode; accent?: string }) {
  const [open, setOpen] = useState(false)
  const colors: Record<string, string> = {
    gold:  'border-gold-500 bg-gold-500/5 text-gold-700',
    blue:  'border-blue-400 bg-blue-50 text-blue-700',
    green: 'border-green-500 bg-green-50 text-green-700',
    navy:  'border-navy-500 bg-navy-500/5 text-navy-500',
  }
  return (
    <div className="rounded-xl border border-navy-500/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-navy-500/5 transition-colors duration-200 text-left group"
      >
        <span className="font-heading font-semibold text-sm text-navy-500 group-hover:text-gold-600 transition-colors">{label}</span>
        <div className="w-6 h-6 rounded-full bg-navy-50 flex items-center justify-center text-navy-400 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      <div style={{ maxHeight: open ? '800px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <div className="px-4 pb-4 pt-2 border-t border-navy-500/8">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function LaplacePage() {
  const [mounted, setMounted] = useState(false)
  const [pdfOpen, setPdfOpen]     = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesPdfOpen, setNotesPdfOpen] = useState(false)
  const [answers, setAnswers]     = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [score, setScore]         = useState<number | null>(null)
  useEffect(() => { setMounted(true) }, [])

  function handleMC(qid: number, opt: string) {
    if (submitted[qid]) return
    setAnswers(p => ({ ...p, [qid]: opt }))
    setSubmitted(p => ({ ...p, [qid]: true }))
  }
  function handleFinish() {
    let s = 0; questions.forEach(q => { if (submitted[q.id] && answers[q.id] === q.correct) s++ }); setScore(s)
  }
  function resetQuiz() { setAnswers({}); setSubmitted({}); setScore(null) }

  const cs = (d: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `all 0.5s ease ${d}s`,
  })

  const answerKey = [
    { id:1,  letter:'B', ans:'F(s) = ∫₀^∞ f(t)e⁻ˢᵗ dt',  exp:'The standard one-sided Laplace transform uses the lower limit 0⁻ and the kernel e⁻ˢᵗ — not eˢᵗ.' },
    { id:2,  letter:'B', ans:'1/(s−a)',                    exp:'Direct computation from the definition: ∫₀^∞ e^(a−s)t dt = 1/(s−a), valid for Re(s) > a.' },
    { id:3,  letter:'C', ans:'1/(s+a)',                    exp:'Replace a with −a in the result for eᵃᵗ: L{e⁻ᵃᵗ} = 1/(s−(−a)) = 1/(s+a).' },
    { id:4,  letter:'C', ans:'a/(s²+a²)',                  exp:'From the table entry #7. The sin transform has the frequency a in the numerator.' },
    { id:5,  letter:'D', ans:'s/(s²+a²)',                  exp:'From table entry #8. The cos transform has s in the numerator, not a.' },
    { id:6,  letter:'B', ans:'L{af+bg} = aF(s)+bG(s)',     exp:'Linearity is the most-used property. Constants factor out and transforms add, matching the original linear combination.' },
    { id:7,  letter:'C', ans:'sF(s) − f(0)',               exp:'Table entry #35. The initial condition f(0) is subtracted. This is why Laplace handles initial conditions automatically.' },
    { id:8,  letter:'A', ans:'(−1)ⁿ F⁽ⁿ⁾(s)',             exp:'Table entry #30. Multiplying by t in time = differentiating F(s) in the s-domain, with a sign factor of (−1)ⁿ.' },
    { id:9,  letter:'B', ans:'F(s)/s',                     exp:'Table entry #32. Integration in time corresponds to division by s — the inverse of the differentiation rule.' },
    { id:10, letter:'C', ans:'F(s−c)',                     exp:'Table entry #29. The frequency shift theorem: multiplying by eᶜᵗ shifts the s-domain argument from s to s−c.' },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="bg-navy-500 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: '#F59E0B', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }}/>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono">
            <a href="/schedule" className="text-gold-400 hover:text-gold-300 transition-colors">Schedule</a>
            <span className="text-white/30">›</span>
            <span className="text-white/50">Modeling in the Frequency Domain</span>
          </div>
          <div className="flex items-center gap-3 mb-3" style={cs(0)}>
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-heading font-bold text-white text-sm shrink-0">W1</div>
            <span className="text-xs text-gold-400 font-semibold uppercase tracking-widest">Control Foundations — Chapter 2</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2" style={cs(0.1)}>
            Laplace Transform Review
          </h1>
          <p className="text-white/60 text-sm max-w-xl" style={cs(0.2)}>
            Transform pairs, properties, complete 37-entry table, and worked examples. Chapter 2 of Nise — Control Systems Engineering.
          </p>
          <div className="flex items-center gap-3 mt-6" style={cs(0.3)}>
            <button onClick={() => setPdfOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white">
              <span>‹</span> Control Bg
            </button>
            <div className="flex-1"/>
            <a href="/notes/modeling"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium text-white">
              Mathematical Modeling <span>›</span>
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── 1. MOTIVATION ───────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.1)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💡</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Why Laplace transforms?</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            A system represented by a <strong className="text-navy-500">differential equation</strong> is difficult to model as a block diagram. The Laplace transform converts those equations into <strong className="text-navy-500">simple algebra</strong> — the input, output, and system become separate entities whose relationship is purely algebraic.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <SVGDefinition />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon:'⚡', title:'Differential → Algebraic',  desc:'Converts d/dt into multiplication by s. No more solving ODEs directly.' },
              { icon:'🔀', title:'Separate representations',  desc:'Input R(s), output Y(s), and system G(s) are three distinct, clean expressions.' },
              { icon:'🎯', title:'Initial conditions built in', desc:'Lower limit 0⁻ handles discontinuities and encodes initial conditions automatically.' },
              { icon:'📊', title:'Transfer function G(s)',     desc:'The ratio Y(s)/U(s) fully characterises any LTI system in one algebraic expression.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-navy-500/5 hover:bg-navy-500/10 hover:-translate-y-0.5 transition-all duration-200">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-heading font-bold text-navy-500 text-sm">{item.title}</div>
                  <div className="text-xs text-navy-300 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. DEFINITION ───────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.13)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📐</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">The Laplace transform definition</h2>
          </div>
          <div className="rounded-xl p-5 bg-navy-500 mb-4">
            <p className="text-xs text-white/50 text-center mb-3">Equation (2.1)</p>
            {/* Inline SVG for proper integral notation with superscript/subscript limits */}
            <svg viewBox="0 0 560 72" className="w-full max-w-lg mx-auto" style={{  fontFamily: 'JetBrains Mono, monospace' }}>
              {/* L[f(t)] = F(s) = */}
              <text x="30"   y="44" fontSize="22" fill="#F59E0B" fontWeight="700">L[f(t)]</text>
              <text x="130" y="44" fontSize="22" fill="#F59E0B" fontWeight="700">=</text>
              <text x="150" y="44" fontSize="22" fill="#F59E0B" fontWeight="700">F(s)</text>
              <text x="205" y="44" fontSize="22" fill="#F59E0B" fontWeight="700">=</text>
              {/* Integral symbol */}
              <text x="220" y="54" fontSize="42" fill="#F59E0B" fontWeight="300">&#x222B;</text>
              {/* Upper limit ∞ */}
              <text x="238" y="22" fontSize="14" fill="#F59E0B" fontWeight="600">&#x221E;</text>
              {/* Lower limit 0⁻ */}
              <text x="235" y="64" fontSize="13" fill="#F59E0B" fontWeight="600">0&#x207B;</text>
              {/* f(t)e */}
              <text x="255" y="44" fontSize="22" fill="#F59E0B" fontWeight="700">f(t) e</text>
              {/* Exponent -st */}
              <text x="330" y="28" fontSize="14" fill="#F59E0B" fontWeight="600">&#x2212;st</text>
              {/* dt */}
              <text x="360" y="44" fontSize="22" fill="#F59E0B" fontWeight="700"> dt</text>
            </svg>
            <p className="text-xs text-white/50 text-center mt-1">where s = σ + jω is a complex variable</p>
          </div>
          <div className="space-y-2">
            {[
              { label:'s = σ + jω',       desc:'Complex variable with real part σ and imaginary part ω. Represents complex frequency.' },
              { label:'Lower limit 0⁻',   desc:'Integration starts just before t = 0, so discontinuities at t = 0 are captured correctly.' },
              { label:'Kernel e⁻ˢᵗ',     desc:'The exponential weighting factor that makes the integral converge for large t.' },
              { label:'F(s) exists when', desc:'The integral converges, i.e. when Re(s) is large enough — this defines the Region of Convergence.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 transition-colors group">
                <span className="font-mono font-bold text-gold-600 text-sm w-32 shrink-0 group-hover:text-gold-700">{item.label}</span>
                <span className="text-sm text-navy-400 leading-relaxed">{item.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <SVGStabilityRegion />
          </div>
        </div>

        {/* ── 3. CALCULUS REVIEW ──────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.16)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📚</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Calculus review</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            Three rules are used repeatedly when computing Laplace transforms from the definition.
          </p>
          <div className="space-y-3">

            {/* Chain rule */}
            <div className="glass rounded-xl p-4 border-l-4 border-blue-400">
              <div className="font-heading font-bold text-navy-500 text-sm mb-2">Chain Rule</div>
              <div className="flex items-center justify-center gap-3 py-3 bg-gray-50 rounded-lg mb-3">
                {/* d/dx as a vertical fraction */}
                <div className="text-center font-math text-gold-600 font-bold">
                  <div className="text-sm border-b-2 border-gold-500 pb-0.5 px-1">d</div>
                  <div className="text-sm pt-0.5 px-1">dx</div>
                </div>
                {/* rest of equation */}
                <span className="font-mono text-gold-600 text-sm font-bold">
                  [f(g(x))] = f'(g(x)) · g'(x)
                </span>
              </div>
              <Collapsible label="Show examples (1–2)">
                <div className="space-y-3 mt-2">
                  {/* Example 1 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-navy-500 mb-1">Example 1: f(x) = eˣ</div>
                    <div className="font-mono text-xs text-gold-700">f'(x) = eˣ  (since (eˣ)' = eˣ)</div>
                  </div>
                  {/* Example 2 — fraction layout */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-navy-500 mb-2">Example 2: f(x) = e²ˣ</div>
                    <div className="space-y-3 font-mono text-xs text-gold-700">
                      <div>Let y = eᵘ,  u = 2x</div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="text-center">
                            <div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">dy</div>
                            <div className="pt-0.5 px-1 leading-tight">du</div>
                          </div>
                          <span>= eᵘ</span>
                        </div>
                        <span className="text-navy-300">,</span>
                        <div className="flex items-center gap-1.5">
                          <div className="text-center">
                            <div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">du</div>
                            <div className="pt-0.5 px-1 leading-tight">dx</div>
                          </div>
                          <span>= 2</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-center">
                          <div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">dy</div>
                          <div className="pt-0.5 px-1 leading-tight">dx</div>
                        </div>
                        <span>=</span>
                        <div className="text-center">
                          <div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">dy</div>
                          <div className="pt-0.5 px-1 leading-tight">du</div>
                        </div>
                        <span>·</span>
                        <div className="text-center">
                          <div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">du</div>
                          <div className="pt-0.5 px-1 leading-tight">dx</div>
                        </div>
                        <span>= eᵘ · 2 = 2e²ˣ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>

            {/* Product rule */}
            <div className="glass rounded-xl p-4 border-l-4 border-green-500">
              <div className="font-heading font-bold text-navy-500 text-sm mb-2">Product Rule</div>
              <div className="flex items-center justify-center gap-3 py-3 bg-gray-50 rounded-lg mb-3">
                <div className="text-center font-math text-gold-600 font-bold">
                  <div className="text-sm border-b-2 border-gold-500 pb-0.5 px-1">d</div>
                  <div className="text-sm pt-0.5 px-1">dx</div>
                </div>
                <span className="font-mono text-gold-600 text-sm font-bold">
                  [f(x)·g(x)] = f'(x)g(x) + f(x)g'(x)
                </span>
              </div>
              <Collapsible label="Show example (3)">
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <div className="text-xs font-bold text-navy-500 mb-1">Example 3: f(x) = xeˣ</div>
                  <div className="font-mono text-xs text-gold-700">
                    (xeˣ)' = (x)'(eˣ) + (x)(eˣ)' = eˣ + xeˣ
                  </div>
                </div>
              </Collapsible>
            </div>

            {/* Substitution rule */}
            <div className="glass rounded-xl p-4 border-l-4 border-purple-400">
              <div className="font-heading font-bold text-navy-500 text-sm mb-2">Substitution Rule (u-substitution)</div>
              <div className="font-mono text-center text-gold-600 text-sm font-bold py-2 bg-gray-50 rounded-lg mb-3">
                ∫ f(g(x))·g'(x) dx = ∫ f(u) du,  where u = g(x)
              </div>
              <Collapsible label="Show examples (4–7)">
                <div className="space-y-3 mt-2">

                  {/* Example 4 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-navy-500 mb-1">Example 4: ∫ e<sup>x</sup> dx</div>
                    <div className="font-mono text-xs text-gold-700">
                      = e<sup>x</sup> + C &nbsp;&nbsp;<span className="text-navy-300">(since (e<sup>x</sup>)' = e<sup>x</sup>)</span>
                    </div>
                  </div>

                  {/* Example 5 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-navy-500 mb-1">Example 5: ∫ e<sup>e<sup>x</sup></sup>·e<sup>x</sup> dx</div>
                    <div className="font-mono text-xs text-gold-700 space-y-1">
                      <div>Let u = e<sup>x</sup> → du = e<sup>x</sup> dx</div>
                      <div>∫ e<sup>u</sup> du = e<sup>u</sup> + C = e<sup>e<sup>x</sup></sup> + C</div>
                    </div>
                  </div>

                  {/* Example 6 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-navy-500 mb-1">Example 6: ∫ e<sup>e<sup>x</sup></sup>·e<sup>x</sup> dx (repeated)</div>
                    <div className="font-mono text-xs text-gold-700">
                      Same result: e<sup>e<sup>x</sup></sup> + C
                    </div>
                  </div>

                  {/* Example 7 — with 1/w as two-line fraction */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-bold text-navy-500 mb-2">
                      Example 7: ∫(1 − <span className="inline-flex flex-col items-center text-[10px] font-mono leading-none align-middle mx-0.5"><span className="border-b border-navy-500 px-0.5">1</span><span className="px-0.5">w</span></span>)cos(w − ln w) dw
                    </div>
                    <div className="font-mono text-xs text-gold-700 space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span>Let u = w − ln w  →  du = (1 −</span>
                        <div className="inline-flex flex-col items-center text-[10px] leading-none mx-0.5">
                          <span className="border-b-2 border-gold-500 px-1 pb-0.5 leading-tight">1</span>
                          <span className="px-1 pt-0.5 leading-tight">w</span>
                        </div>
                        <span>) dw</span>
                      </div>
                      <div>∫ cos(u) du = sin(u) + C = sin(w − ln w) + C</div>
                    </div>
                  </div>

                </div>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* ── 4. COMPUTING FROM DEFINITION ────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.19)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔬</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Computing from the definition</h2>
          </div>

          {/* Example 2.1 */}
          <div className="glass rounded-xl p-4 border-l-4 border-gold-500 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-gold-500 text-navy-500 text-xs font-bold">Example 2.1</span>
              <span className="font-heading font-bold text-navy-500 text-sm">Find L{'{'}Ae⁻ᵃᵗu(t){'}'}</span>
            </div>
            <div className="font-mono text-sm text-gold-600 font-bold text-center py-2 bg-gray-50 rounded-lg mb-3">
              f(t) = A e⁻ᵃᵗ u(t)  →  F(s) = ?
            </div>
            <Collapsible label="Show full derivation">
              <div className="space-y-2 mt-3">
                {[
                  { step:'Apply definition',       eq:'F(s) = ∫₀^∞ Ae⁻ᵃᵗ · e⁻ˢᵗ dt' },
                  { step:'Combine exponents',      eq:'= A ∫₀^∞ e⁻⁽ˢ⁺ᵃ⁾ᵗ dt' },
                  { step:'Apply limits (→0 at ∞)', eq:'= A [0 − (−1/(s+a))]' },
                ].map((r, i) => (
                  <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-gray-50">
                    <span className="text-xs w-40 shrink-0 text-navy-300">{r.step}</span>
                    <span className="font-mono text-sm font-bold text-gold-600">{r.eq}</span>
                  </div>
                ))}
                {/* Integrate step with fraction */}
                <div className="flex gap-3 p-2.5 rounded-lg bg-gray-50 items-center">
                  <span className="text-xs w-40 shrink-0 text-navy-300">Integrate</span>
                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-gold-600">
                    <span>= A [</span>
                    <div className="text-center mx-1">
                      <div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">−1</div>
                      <div className="pt-0.5 px-1 leading-tight">s+a</div>
                    </div>
                    <span>· e⁻⁽ˢ⁺ᵃ⁾ᵗ]₀^∞</span>
                  </div>
                </div>
                {/* Final result with fraction */}
                <div className="flex gap-3 p-2.5 rounded-lg bg-navy-500 items-center">
                  <span className="text-xs w-40 shrink-0 text-white/50">Final result</span>
                  <div className="flex items-center gap-2 font-mono text-sm font-bold text-gold-400">
                    <span>F(s) =</span>
                    <div className="text-center">
                      <div className="border-b-2 border-gold-400 pb-0.5 px-2 leading-tight">A</div>
                      <div className="pt-0.5 px-2 leading-tight">s + a</div>
                    </div>
                  </div>
                </div>
              </div>
            </Collapsible>
          </div>

          {/* L{e^at} */}
          <div className="glass rounded-xl p-4 border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-lg bg-blue-500 text-white text-xs font-bold">Derivation</span>
              <span className="font-heading font-bold text-navy-500 text-sm">Compute L{'{'}eᵃᵗ{'}'}</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-lg mb-3 font-mono text-sm font-bold text-gold-600 flex-wrap">
              <span>f(t) = eᵃᵗ  →  F(s) =</span>
              <div className="text-center">
                <div className="border-b-2 border-gold-500 pb-0.5 px-2 leading-tight">1</div>
                <div className="pt-0.5 px-2 leading-tight">s − a</div>
              </div>
              <span>,  provided s &gt; a</span>
            </div>
            <Collapsible label="Show step-by-step derivation">
              <div className="bg-gray-50 rounded-xl p-4 mt-3">
                <SVGEatDerivation />
              </div>
            </Collapsible>
          </div>
        </div>

        {/* ── 5. PROPERTIES ───────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.22)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚙️</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Properties of the Laplace transform</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <SVGProperties />
          </div>
          <div className="space-y-3">
            {/* Helper: inline fraction component */}
            {[
              {
                color:'border-blue-400', badge:'bg-blue-500', label:'Linearity',
                eq: <span className="font-mono text-sm text-gold-600 font-bold">L&#123;af(t) + bg(t)&#125; = aF(s) + bG(s)</span>,
                note:'Given f(t) and g(t), for any constants a and b.',
                question:'f(t) = 6e⁻⁵ᵗ + e³ᵗ + 5t³ − 9',
                answer: (
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-green-700 font-bold">
                    <span>F(s) =</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">6</div><div className="pt-0.5 px-1 leading-tight">s+5</div></div>
                    <span>+</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">1</div><div className="pt-0.5 px-1 leading-tight">s−3</div></div>
                    <span>+</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">30</div><div className="pt-0.5 px-1 leading-tight">s⁴</div></div>
                    <span>−</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">9</div><div className="pt-0.5 px-1 leading-tight">s</div></div>
                  </div>
                ),
              },
              {
                color:'border-green-500', badge:'bg-green-500', label:'Differentiation',
                eq: <span className="font-mono text-sm text-gold-600 font-bold">L&#123;f'(t)&#125; = sF(s) − f(0)</span>,
                note:'Each derivative multiplies by s and subtracts an initial condition.',
                question:"L{f''(t)} = ?",
                answer: <span className="font-mono text-xs text-green-700 font-bold">L&#123;f''(t)&#125; = s²F(s) − sf(0) − f'(0)</span>,
              },
              {
                color:'border-gold-500', badge:'bg-gold-500', label:'Multiplication by tⁿ (Entry #30)',
                eq: <span className="font-mono text-sm text-gold-600 font-bold">L&#123;tⁿf(t)&#125; = (−1)ⁿ F⁽ⁿ⁾(s)</span>,
                note:'Multiplying by t in time = differentiating F(s) once, with a sign change.',
                question:'L{t·f(t)} = ?',
                answer: <span className="font-mono text-xs text-green-700 font-bold">L&#123;t·f(t)&#125; = −F'(s)   [entry #30, n=1]</span>,
              },
              {
                color:'border-purple-400', badge:'bg-purple-500', label:'Integration (Entry #32)',
                eq: (
                  <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-sm text-gold-600 font-bold">
                    <span>L&#123;∫₀ᵗ f(v)dv&#125; =</span>
                    <div className="text-center"><div className="border-b-2 border-gold-500 pb-0.5 px-2 leading-tight">F(s)</div><div className="pt-0.5 px-2 leading-tight">s</div></div>
                  </div>
                ),
                note:'Integration in time corresponds to division by s.',
                question:'L{∫₀ᵗ sin(2v)dv} = ?',
                answer: (
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-green-700 font-bold">
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">2</div><div className="pt-0.5 px-1 leading-tight">s²+4</div></div>
                    <span>÷ s =</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">2</div><div className="pt-0.5 px-1 leading-tight">s(s²+4)</div></div>
                  </div>
                ),
              },
              {
                color:'border-red-400', badge:'bg-red-500', label:'Frequency Shift (Entry #29)',
                eq: <span className="font-mono text-sm text-gold-600 font-bold">L&#123;eᶜᵗf(t)&#125; = F(s−c)</span>,
                note:'Multiplying by eᶜᵗ in time shifts the entire transform from s to s−c.',
                question:'L{e³ᵗ cos(6t)} = ?',
                answer: (
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-green-700 font-bold">
                    <span>=</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">s − 3</div><div className="pt-0.5 px-1 leading-tight">(s−3)² + 36</div></div>
                    <span className="text-green-600 font-normal italic">[shift cos by 3]</span>
                  </div>
                ),
              },
              {
                color:'border-teal-400', badge:'bg-teal-500', label:'Time Scaling (Entry #24)',
                eq: (
                  <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-sm text-gold-600 font-bold">
                    <span>L&#123;f(ct)&#125; =</span>
                    <div className="text-center"><div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">1</div><div className="pt-0.5 px-1 leading-tight">c</div></div>
                    <span>· F(</span>
                    <div className="text-center"><div className="border-b-2 border-gold-500 pb-0.5 px-1 leading-tight">s</div><div className="pt-0.5 px-1 leading-tight">c</div></div>
                    <span>)</span>
                  </div>
                ),
                note:'Compressing time expands the s-domain (and vice versa).',
                question:'L{f(10t)} = ? where F(s) is known',
                answer: (
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs text-green-700 font-bold">
                    <span>=</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">1</div><div className="pt-0.5 px-1 leading-tight">10</div></div>
                    <span>· F(</span>
                    <div className="text-center"><div className="border-b-2 border-green-500 pb-0.5 px-1 leading-tight">s</div><div className="pt-0.5 px-1 leading-tight">10</div></div>
                    <span>)</span>
                  </div>
                ),
              },
            ].map((prop, i) => (
              <div key={i} className={`glass rounded-xl p-4 border-l-4 ${prop.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-lg ${prop.badge} text-white text-xs font-bold`}>{i+1}</span>
                  <span className="font-heading font-bold text-navy-500 text-sm">{prop.label}</span>
                </div>
                <div className="flex items-center justify-center py-3 bg-gray-50 rounded-lg mb-2 min-h-[48px]">
                  {prop.eq}
                </div>
                <p className="text-xs text-navy-400 mb-2">{prop.note}</p>
                <Collapsible label="Show worked example">
                  <div className="space-y-2 mt-2">
                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700">Find: {prop.question}</div>
                    <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-semibold text-green-700 mr-1">Answer:</span>
                      {prop.answer}
                    </div>
                  </div>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. LAPLACE TABLE ────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.25)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📋</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Complete Laplace transform table</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-navy-50 text-navy-400 border border-navy-200">37 entries</span>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            All standard pairs used in this course. Entries #25–26 use the Heaviside and Dirac delta functions. Entries #35–37 are the differentiation rules.
          </p>
          <div className="overflow-x-auto rounded-xl border border-navy-500/10">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-navy-500 text-white">
                  <th className="px-3 py-2.5 text-center font-bold w-10">#</th>
                  <th className="px-3 py-2.5 text-left font-bold">f(t) = L⁻¹{'{F(s)}'}</th>
                  <th className="px-3 py-2.5 text-left font-bold">F(s) = L{'{f(t)}'}</th>
                </tr>
              </thead>
              <tbody>
                {laplaceTable.map((row, i) => (
                  <tr key={i}
                    className={`border-b border-navy-500/8 hover:bg-gold-500/5 transition-colors ${
                      [24,25,26,27,28,29,30,31,32,33,34].includes(parseInt(row.n)) ? 'bg-blue-50/40' :
                      [35,36,37].includes(parseInt(row.n)) ? 'bg-green-50/40' : ''
                    }`}>
                    <td className="px-3 py-2 text-center font-mono font-bold text-gold-600">{row.n}</td>
                    <td className="px-3 py-2 font-mono text-navy-500">{row.ft}</td>
                    <td className="px-3 py-2 font-mono text-navy-500 font-semibold">{row.Fs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex gap-4 text-xs text-navy-300">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200 inline-block"/>#24–34: special functions & operations</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-50 border border-green-200 inline-block"/>#35–37: differentiation rules</span>
          </div>
        </div>

        {/* ── 7. WORKED EXAMPLES ──────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.28)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✏️</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Worked examples</h2>
          </div>

          {/* Reusable fraction helper */}
          {(() => {
            const Frac = ({ n, d, color='border-navy-400 text-navy-500' }: { n: string; d: string; color?: string }) => (
              <div className="text-center inline-flex flex-col items-center mx-0.5">
                <div className={`font-mono text-sm font-bold border-b-2 pb-0.5 px-2 leading-tight ${color}`}>{n}</div>
                <div className={`font-mono text-sm font-bold pt-0.5 px-2 leading-tight ${color.split(' ').filter(c=>c.startsWith('text-')).join(' ')}`}>{d}</div>
              </div>
            )
            const GFrac = ({ n, d }: { n: string; d: string }) => <Frac n={n} d={d} color="border-gold-400 text-gold-400"/>

            const examples = [
              {
                label:'A', color:'border-blue-400', badge:'bg-blue-500',
                q:'Find G(s) for:', fn:'g(t) = 4cos(4t) − 9sin(4t) + 2cos(10t)',
                hint:'Use entries #7 and #8 with linearity.',
                steps:[
                  { desc:'Entry #8 for cos(4t), entry #7 for sin(4t), with linearity',
                    body: <div className="flex items-center gap-2 justify-center flex-wrap"><Frac n="4s" d="s²+16"/> <span className="font-mono font-bold text-navy-400">−</span> <Frac n="9·4" d="s²+16"/> <span className="font-mono font-bold text-navy-500">+</span> <Frac n="2s" d="s²+100"/></div> },
                  { desc:'Simplify numerators',
                    body: <div className="flex items-center gap-2 justify-center flex-wrap"><Frac n="4s" d="s²+16"/> <span className="font-mono font-bold text-navy-400">−</span> <Frac n="36" d="s²+16"/> <span className="font-mono font-bold text-navy-500">+</span> <Frac n="2s" d="s²+100"/></div> },
                ],
                finalLabel:'G(s)', finalBody: <div className="flex items-center gap-2 justify-center flex-wrap"><GFrac n="4s − 36" d="s² + 16"/> <span className="font-mono font-bold text-gold-300">+</span> <GFrac n="2s" d="s² + 100"/></div>,
              },
              {
                label:'B', color:'border-green-400', badge:'bg-green-500',
                q:'Find H(s) for:', fn:'h(t) = 3sinh(2t) + 3sin(2t)',
                hint:'Use entry #17 for sinh, entry #7 for sin.',
                steps:[
                  { desc:'Entry #17: a/(s²−a²), entry #7: a/(s²+a²), with a=2',
                    body: <div className="flex items-center gap-2 justify-center flex-wrap"><Frac n="3·2" d="s²−4"/> <span className="font-mono font-bold text-navy-500">+</span> <Frac n="3·2" d="s²+4"/></div> },
                ],
                finalLabel:'H(s)', finalBody: <div className="flex items-center gap-2 justify-center flex-wrap"><GFrac n="6" d="s² − 4"/> <span className="font-mono font-bold text-gold-300">+</span> <GFrac n="6" d="s² + 4"/></div>,
              },
              {
                label:'C', color:'border-amber-400', badge:'bg-amber-500',
                q:'Find G(s) for:', fn:'g(t) = e³ᵗ + cos(6t) − e³ᵗcos(6t)',
                hint:'Use #2 for e³ᵗ, #8 for cos(6t), #20 for e³ᵗcos(6t) (frequency shift).',
                steps:[
                  { desc:'Entry #2: L{e³ᵗ}', body: <div className="flex items-center gap-2 justify-center"><Frac n="1" d="s−3"/></div> },
                  { desc:'Entry #8: L{cos(6t)}', body: <div className="flex items-center gap-2 justify-center"><Frac n="s" d="s²+36"/></div> },
                  { desc:'Entry #20: L{e³ᵗcos(6t)}', body: <div className="flex items-center gap-2 justify-center"><Frac n="s−3" d="(s−3)²+36"/></div> },
                ],
                finalLabel:'G(s)', finalBody: <div className="flex items-center gap-2 justify-center flex-wrap"><GFrac n="1" d="s − 3"/> <span className="font-mono font-bold text-gold-300">+</span> <GFrac n="s" d="s²+36"/> <span className="font-mono font-bold text-gold-300">−</span> <GFrac n="s−3" d="(s−3)²+36"/></div>,
              },
              {
                label:'D', color:'border-purple-400', badge:'bg-purple-500',
                q:'Find F(s) for: (not directly in table)', fn:'f(t) = t · cosh(3t)',
                hint:"Entry #30: L{t·g(t)} = −G'(s). Let g(t) = cosh(3t).",
                steps:[
                  { desc:'Entry #18: G(s) = L{cosh(3t)}', body: <div className="flex items-center gap-2 justify-center"><Frac n="s" d="s²−9"/></div> },
                  { desc:"G'(s) = differentiate s/(s²−9)", body: <div className="flex items-center gap-2 justify-center"><Frac n="−(s²+9)" d="(s²−9)²"/></div> },
                  { desc:"F(s) = −G'(s)", body: <div className="flex items-center gap-2 justify-center"><Frac n="s²+9" d="(s²−9)²"/></div> },
                ],
                finalLabel:'F(s)', finalBody: <div className="flex items-center gap-2 justify-center"><GFrac n="s² + 9" d="(s² − 9)²"/></div>,
              },
              {
                label:'E', color:'border-red-400', badge:'bg-red-500',
                q:'Find H(s) for:', fn:'h(t) = t² · sin(2t)',
                hint:'Use entry #30 with n=1 on f(t)=t·sin(2t).',
                steps:[
                  { desc:'Entry #9: L{t·sin(2t)}, a=2', body: <div className="flex items-center gap-2 justify-center"><Frac n="4s" d="(s²+4)²"/></div> },
                  { desc:"F'(s) via quotient rule", body: <div className="flex items-center gap-2 justify-center"><Frac n="−(12s²−16)" d="(s²+4)³"/></div> },
                  { desc:"H(s) = −F'(s)", body: <div className="flex items-center gap-2 justify-center"><Frac n="12s²−16" d="(s²+4)³"/></div> },
                ],
                finalLabel:'H(s)', finalBody: <div className="flex items-center gap-2 justify-center"><GFrac n="12s² − 16" d="(s² + 4)³"/></div>,
              },
              {
                label:'F', color:'border-teal-400', badge:'bg-teal-500',
                q:'Find G(s) for:', fn:'g(t) = t^(3/2)',
                hint:'Use entry #32 and entry #5: t^(3/2) = (3/2)∫₀ᵗ√v dv.',
                steps:[
                  { desc:'Identity: ∫₀ᵗ √v dv = (2/3)t^(3/2)  ⟹  t^(3/2) = (3/2)∫₀ᵗ √v dv', body: null },
                  { desc:'Entry #5: L{√t}', body: <div className="flex items-center gap-2 justify-center"><Frac n="√π" d="2s^(3/2)"/></div> },
                  { desc:'Entry #32: divide by s, multiply by 3/2', body: <div className="flex items-center gap-2 justify-center"><Frac n="(3/2)·√π" d="2s^(3/2)·s"/></div> },
                ],
                finalLabel:'G(s)', finalBody: <div className="flex items-center gap-2 justify-center"><GFrac n="3√π" d="4s^(5/2)"/></div>,
              },
              {
                label:'G', color:'border-indigo-400', badge:'bg-indigo-500',
                q:'Find F(s) for:', fn:'f(t) = (10t)^(3/2)',
                hint:'f(t) = g(10t). Use entry #24: L{f(ct)} = (1/c)F(s/c).',
                steps:[
                  { desc:'From Example F: G(s)', body: <div className="flex items-center gap-2 justify-center"><Frac n="3√π" d="4s^(5/2)"/></div> },
                  { desc:'Entry #24, c=10: F(s) = (1/10)·G(s/10)', body: <div className="flex items-center gap-2 justify-center"><div className="text-center inline-flex flex-col items-center mx-0.5"><div className="font-mono text-sm font-bold border-b-2 border-navy-400 pb-0.5 px-2 leading-tight text-navy-500">(1/10)·3√π</div><div className="font-mono text-sm font-bold pt-0.5 px-2 leading-tight text-navy-500">4·(s/10)^(5/2)</div></div></div> },
                  { desc:'Simplify: (1/10)·10^(5/2) = 10^(3/2)', body: <div className="flex items-center gap-2 justify-center"><Frac n="10^(3/2)·3√π" d="4s^(5/2)"/></div> },
                ],
                finalLabel:'F(s)', finalBody: <div className="flex items-center gap-2 justify-center"><GFrac n="10^(3/2) · 3√π" d="4s^(5/2)"/></div>,
              },
            ]

            return (
              <div className="space-y-3">
                {examples.map((ex, i) => (
                  <div key={i} className={`glass rounded-xl p-4 border-l-4 ${ex.color}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`w-7 h-7 rounded-full ${ex.badge} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{ex.label}</span>
                      <div className="flex-1">
                        <div className="text-xs text-navy-300 font-medium">{ex.q}</div>
                        <div className="font-heading font-bold text-navy-500 text-sm mt-0.5">{ex.fn}</div>
                        <div className="text-xs text-navy-300 italic mt-1">{ex.hint}</div>
                      </div>
                    </div>
                    <Collapsible label="Show solution">
                      <div className="space-y-3 mt-3">
                        {ex.steps.map((step, j) => (
                          <div key={j} className="bg-gray-50 rounded-xl p-3">
                            <div className="text-xs text-navy-300 mb-2 font-medium">Step {j+1}: {step.desc}</div>
                            {step.body}
                          </div>
                        ))}
                        <div className="rounded-xl p-4 bg-navy-500">
                          <div className="text-xs text-white/50 text-center mb-3">Final Answer</div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-gold-400 font-mono font-bold text-sm">{ex.finalLabel} =</span>
                            {ex.finalBody}
                          </div>
                        </div>
                      </div>
                    </Collapsible>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* ── 8. KEY TERMS ────────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.31)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📖</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Key terms</h2>
          </div>
          <div className="space-y-2">
            {keyTerms.map((t, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-navy-500/5 hover:-translate-x-0.5 transition-all duration-200 group">
                <span className="font-heading font-bold text-gold-600 text-sm w-36 shrink-0 group-hover:text-gold-700 transition-colors">{t.term}</span>
                <span className="text-sm text-navy-400 leading-relaxed">{t.def}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. QUIZ + ANSWER KEY ────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.34)}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🧠</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Test your understanding</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            10 multiple choice questions covering the definition, transform pairs, properties, and table entries.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setQuizOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-500 text-white font-semibold text-sm hover:bg-navy-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              Start quiz
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={() => setNotesOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              Answer key &amp; notes
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* ── 10. PDF1 DOWNLOAD ────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.37)}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📄</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Session 3 Lecture Notes #1</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            Full PDF including all derivations, the complete 37-entry table, worked examples, and glossary.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setNotesPdfOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-500 text-white font-semibold text-sm hover:bg-navy-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M2 2h9l3 3v9H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 2v3h3M5 9h6M5 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              View PDF notes
            </button>
            <a href="/MEEN424_Session3_Notes.pdf" download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download
            </a>
          </div>
        </div>

        {/* ── 10. PDF2 DOWNLOAD ────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={cs(0.37)}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📄</span>
            <h2 className="font-heading font-bold text-navy-500 text-lg">Session 3 Lecture Notes #2</h2>
          </div>
          <p className="text-sm text-navy-400 leading-relaxed mb-4">
            Full PDF including all derivations, the complete 37-entry table, worked examples, and glossary.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setNotesPdfOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-500 text-white font-semibold text-sm hover:bg-navy-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M2 2h9l3 3v9H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 2v3h3M5 9h6M5 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              View PDF notes
            </button>
            <a href="/MEEN424_Session3_Notes_part2.pdf" download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download
            </a>
          </div>
        </div>

        {/* ── 11. NEXT SESSION ────────────────────────────────── */}
        <div className="rounded-2xl p-6 bg-navy-500 text-white relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style={cs(0.4)}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: '#F59E0B', filter: 'blur(40px)', transform: 'translate(20%,-20%)' }}/>
          <p className="text-xs text-gold-400 font-semibold uppercase tracking-widest mb-2">Coming up next</p>
          <h3 className="font-heading font-bold text-xl mb-1">Mathematical Modeling</h3>
          <p className="text-white/60 text-sm mb-5">
            Newton's laws applied to mechanical systems. Free body diagrams, spring-mass-damper equations of motion.
          </p>
          <a href="/notes/modeling"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-500 font-semibold text-sm hover:bg-gold-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            Open notes
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

      </div>

      {/* ── SYLLABUS PDF MODAL ───────────────────────────────── */}
      {pdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setPdfOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col"
            style={{ height: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">PDF</div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-white text-sm">Course Syllabus</div>
                <div className="text-xs text-white/50 font-mono">MEEN 424 — Summer II 2026</div>
              </div>
              <a href="/Syllabus.pdf" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors shrink-0">Download</a>
              <button onClick={() => setPdfOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors shrink-0 text-sm font-bold">X</button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src="/Syllabus.pdf" className="w-full h-full" title="MEEN 424 Syllabus" style={{ border: 'none' }}/>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTES PDF MODAL ─────────────────────────────────── */}
      {notesPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.80)', backdropFilter: 'blur(8px)' }}
          onClick={() => setNotesPdfOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col"
            style={{ height: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">PDF</div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-white text-sm">Session 3 Lecture Notes</div>
                <div className="text-xs text-white/50 font-mono">MEEN 424 — Laplace Transform Review</div>
              </div>
              <a href="/MEEN424_Session3_Notes.pdf" download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors shrink-0">
                <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </a>
              <button onClick={() => setNotesPdfOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors shrink-0 text-sm font-bold">X</button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src="/MEEN424_Session3_Notes.pdf" className="w-full h-full" title="Session 3 Notes" style={{ border: 'none' }}/>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTES PDF MODAL ─────────────────────────────────── */}
      {notesPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.80)', backdropFilter: 'blur(8px)' }}
          onClick={() => setNotesPdfOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl flex flex-col"
            style={{ height: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-3 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">PDF</div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-white text-sm">Session 3 Lecture Notes</div>
                <div className="text-xs text-white/50 font-mono">MEEN 424 — Laplace Transform Review</div>
              </div>
              <a href="/MEEN424_Session3_Notes_part2.pdf" download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors shrink-0">
                <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download
              </a>
              <button onClick={() => setNotesPdfOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors shrink-0 text-sm font-bold">X</button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe src="/MEEN424_Session3_Notes_part2.pdf" className="w-full h-full" title="Session 3 Notes" style={{ border: 'none' }}/>
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZ MODAL ──────────────────────────────────────── */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.80)', backdropFilter: 'blur(8px)' }}
          onClick={() => setQuizOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col"
            style={{ height: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-navy-500 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center text-navy-500 font-bold text-xs shrink-0">Q</div>
              <div className="flex-1">
                <div className="font-heading font-bold text-white text-sm">Laplace Transform — Quiz</div>
                <div className="text-xs text-white/50">{questions.length} multiple choice questions</div>
              </div>
              {score !== null && <div className="px-3 py-1 rounded-lg bg-gold-500 text-navy-500 font-bold text-sm">{score}/{questions.length}</div>}
              <button onClick={() => { setQuizOpen(false); resetQuiz() }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 flex items-center justify-center text-white transition-colors text-sm font-bold shrink-0">X</button>
            </div>
            {score !== null && (
              <div className={'px-5 py-3 text-sm font-semibold flex items-center gap-2 shrink-0 ' + (score>=8?'bg-green-50 text-green-700':score>=5?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700')}>
                <span className="text-lg">{score>=8?'🎉':score>=5?'👍':'📚'}</span>
                {score>=8?'Excellent! Strong grasp of Laplace fundamentals.':score>=5?'Good effort — review the sections you missed.':'Keep studying — revisit the table and properties.'}
                <button onClick={resetQuiz} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Retake</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {questions.map(q => {
                const isSubmitted = submitted[q.id], userAns = answers[q.id] || '', isCorrect = userAns === q.correct
                return (
                  <div key={q.id} className={'glass rounded-xl p-4 transition-all duration-300 ' + (isSubmitted?(isCorrect?'border-l-4 border-green-500':'border-l-4 border-red-400'):'hover:-translate-y-0.5 hover:shadow-md')}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{q.id}</span>
                      <p className="text-sm font-semibold text-navy-500 leading-relaxed">{q.q}</p>
                    </div>
                    <div className="space-y-2 ml-8">
                      {q.options.map((opt, oi) => {
                        let st = 'bg-gray-50 border-gray-200 text-navy-400 hover:border-navy-300 hover:bg-navy-500/5'
                        if (isSubmitted) {
                          if (opt === q.correct) st = 'bg-green-50 border-green-400 text-green-700 font-semibold'
                          else if (opt === userAns) st = 'bg-red-50 border-red-400 text-red-600 line-through'
                          else st = 'bg-gray-50 border-gray-200 text-navy-300 opacity-40'
                        }
                        return <button key={oi} onClick={() => handleMC(q.id, opt)} className={'w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all duration-200 '+st} disabled={isSubmitted}>
                          <span className="font-mono font-bold mr-2 opacity-60">{String.fromCharCode(65+oi)}.</span>{opt}
                        </button>
                      })}
                      {isSubmitted && <p className={'text-xs mt-1 font-medium '+(isCorrect?'text-green-600':'text-red-500')}>{isCorrect?'Correct!':'Incorrect — correct answer highlighted in green.'}</p>}
                    </div>
                  </div>
                )
              })}
              {score === null && (
                <button onClick={handleFinish} className="w-full py-3 rounded-xl bg-gold-500 text-navy-500 font-heading font-bold text-sm hover:bg-gold-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                  Finish and see score
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ANSWER KEY MODAL ────────────────────────────────── */}
      {notesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(11,42,74,0.80)', backdropFilter: 'blur(8px)' }}
          onClick={() => setNotesOpen(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col"
            style={{ height: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="bg-gold-500 px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-navy-500 flex items-center justify-center text-white font-bold text-xs shrink-0">AN</div>
              <div className="flex-1">
                <div className="font-heading font-bold text-navy-500 text-sm">Answer Key &amp; Study Notes</div>
                <div className="text-xs text-navy-500/60">Laplace Transform Review — Session 3</div>
              </div>
              <button onClick={() => setNotesOpen(false)}
                className="w-8 h-8 rounded-lg bg-navy-500/20 hover:bg-navy-500/40 flex items-center justify-center text-navy-500 transition-colors text-sm font-bold shrink-0">X</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* Answer key */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="bg-navy-500 px-4 py-3">
                  <div className="font-heading font-bold text-white text-sm">Quiz Answer Key</div>
                  <div className="text-xs text-white/50 mt-0.5">All 10 answers with letter, answer text, and explanation</div>
                </div>
                <div className="divide-y divide-navy-500/8">
                  {answerKey.map((item, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-navy-500/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-navy-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{item.id}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded-md bg-green-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{item.letter}</span>
                            <span className="text-xs font-semibold text-green-600 font-mono">{item.ans}</span>
                          </div>
                          <div className="text-xs text-navy-400 leading-relaxed ml-8">{item.exp}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key formulas */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="bg-navy-500 px-4 py-3">
                  <div className="font-heading font-bold text-white text-sm">Key Formulas to Remember</div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label:'Definition',              formula:'F(s) = ∫₀⁻^∞ f(t)e⁻ˢᵗ dt',          note:'Kernel is e⁻ˢᵗ, lower limit 0⁻' },
                    { label:'L{eᵃᵗ}',                 formula:'1/(s−a)',                              note:'Valid for Re(s) > a' },
                    { label:'L{e⁻ᵃᵗu(t)}',            formula:'1/(s+a)',                              note:'Most common in control systems' },
                    { label:'L{sin(at)}',              formula:'a/(s²+a²)',                            note:'a in numerator' },
                    { label:'L{cos(at)}',              formula:'s/(s²+a²)',                            note:'s in numerator' },
                    { label:'Linearity',               formula:'L{af+bg} = aF+bG',                    note:'Most-used property' },
                    { label:"L{f'(t)}",                formula:'sF(s) − f(0)',                         note:'Differentiation → multiply by s' },
                    { label:'L{tⁿf(t)}  #30',         formula:'(−1)ⁿ F⁽ⁿ⁾(s)',                      note:'Multiply by t → differentiate F(s)' },
                    { label:'L{∫₀ᵗ f}  #32',          formula:'F(s)/s',                               note:'Integration → divide by s' },
                    { label:'L{eᶜᵗf(t)}  #29',        formula:'F(s−c)',                               note:'Frequency shift theorem' },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="text-xs text-navy-300 mb-0.5">{f.label}</div>
                        <div className="font-mono text-sm font-bold text-gold-600">{f.formula}</div>
                        <div className="text-xs text-navy-300 italic mt-0.5">{f.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study tips */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="bg-navy-500 px-4 py-3">
                  <div className="font-heading font-bold text-white text-sm">Study Tips for This Session</div>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    'Memorize the 5 most common pairs: 1, eᵃᵗ, tⁿ, sin(at), cos(at) — they appear on every exam.',
                    'The differentiation rule L{f\'} = sF−f(0) is the key that makes Laplace useful for control systems.',
                    'Entry #30 L{tⁿf} = (−1)ⁿF⁽ⁿ⁾(s) — when you see t multiplying a function, differentiate F(s).',
                    'The frequency shift L{eᵃᵗf(t)} = F(s−a) — replace s with s−a in the known transform.',
                    'Always check the region of convergence — L{eᵃᵗ} = 1/(s−a) requires Re(s) > a.',
                    'For composite time functions, identify which table entry applies and use linearity to combine.',
                    'The transfer function G(s) = Y(s)/U(s) — this is what Laplace enables and what the rest of the course uses.',
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start p-2 rounded-lg hover:bg-navy-500/5 transition-colors">
                      <span className="w-5 h-5 rounded-full bg-gold-500 text-navy-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                      <span className="text-xs text-navy-400 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
