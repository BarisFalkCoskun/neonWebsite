import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

// ============================================
// SVG NEON TUBE COMPONENTS
// ============================================

// SVG Filter for realistic neon glow
const NeonFilters = () => (
  <svg className="svg-filters">
    <defs>
      {/* Pink Neon Glow */}
      <filter id="neon-pink" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur3" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur4" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur5" />
        <feMerge>
          <feMergeNode in="blur5" />
          <feMergeNode in="blur4" />
          <feMergeNode in="blur3" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Blue Neon Glow */}
      <filter id="neon-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur3" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur4" />
        <feMerge>
          <feMergeNode in="blur4" />
          <feMergeNode in="blur3" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
)

// ============================================
// NEON ARROW COMPONENT (Classic Vegas Style)
// ============================================

const NeonArrow = ({ color = '#ff6ec7', direction = 'right', animated = true, size = 80 }) => {
  const rotation = {
    right: 0,
    down: 90,
    left: 180,
    up: -90
  }[direction]

  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      style={{
        transform: `rotate(${rotation}deg)`,
        filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color})`
      }}
      className={animated ? 'pulse' : ''}
    >
      <path
        d="M 10 30 L 60 30 L 60 15 L 90 30 L 60 45 L 60 30"
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ============================================
// NEON STAR/BURST COMPONENT
// ============================================

const NeonStar = ({ color = '#ffea00', size = 60, points = 4, animated = true }) => {
  const createStarPath = () => {
    const cx = 50, cy = 50
    const outerR = 45, innerR = 20
    let path = ''

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (Math.PI * i) / points - Math.PI / 2
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      path += (i === 0 ? 'M' : 'L') + ` ${x} ${y} `
    }
    path += 'Z'
    return path
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})`
      }}
      className={animated ? 'pulse' : ''}
    >
      <path
        d={createStarPath()}
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
    </svg>
  )
}

// ============================================
// NEON CIRCLE/RING COMPONENT
// ============================================

const NeonCircle = ({ color = '#00fff9', size = 100, animated = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{
      filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color})`
    }}
    className={animated ? 'pulse' : ''}
  >
    <circle
      cx="50"
      cy="50"
      r="42"
      stroke={color}
      strokeWidth="4"
      fill="none"
    />
  </svg>
)

// ============================================
// NEON TEXT SIGN COMPONENT
// ============================================

const NeonTextSign = ({
  text,
  color = 'pink',
  fontSize = '4rem',
  fontFamily = 'Satisfy',
  flickering = false,
  isOn = true,
  className = ''
}) => {
  const colorClasses = {
    pink: 'neon-pink',
    blue: 'neon-blue',
    red: 'neon-red',
    yellow: 'neon-yellow',
    green: 'neon-green',
    orange: 'neon-orange',
    purple: 'neon-purple',
    white: 'neon-white'
  }

  return (
    <span
      className={`
        ${colorClasses[color] || colorClasses.pink}
        ${flickering ? 'flicker' : 'hum'}
        ${!isOn ? 'neon-off' : ''}
        ${className}
      `}
      style={{
        fontFamily: `'${fontFamily}', cursive`,
        fontSize,
        display: 'inline-block'
      }}
    >
      {text}
    </span>
  )
}

// ============================================
// MOUNTED SIGN COMPONENT (with backing & screws)
// ============================================

const MountedSign = ({ children, className = '' }) => (
  <div className={`neon-sign ${className}`}>
    <div className="sign-backing sign-screws-bottom">
      {children}
    </div>
  </div>
)

// ============================================
// OPEN/CLOSED SIGN
// ============================================

const OpenSign = ({ isOpen = true, onClick }) => {
  const [flickerState, setFlickerState] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      if (Math.random() > 0.97) {
        setFlickerState(false)
        setTimeout(() => setFlickerState(true), 80 + Math.random() * 120)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isOpen])

  return (
    <div className="open-sign" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="open-sign-frame">
        <NeonTextSign
          text={isOpen ? 'OPEN' : 'CLOSED'}
          color={isOpen ? 'green' : 'red'}
          fontSize="3.5rem"
          isOn={isOpen ? flickerState : true}
        />
      </div>
    </div>
  )
}

// ============================================
// COCKTAIL GLASS NEON SIGN
// ============================================

const CocktailSign = ({ animated = true }) => (
  <div className="cocktail-sign">
    <svg
      width="120"
      height="140"
      viewBox="0 0 120 140"
      style={{
        filter: 'drop-shadow(0 0 5px #00fff9) drop-shadow(0 0 10px #00fff9) drop-shadow(0 0 20px #00fff9) drop-shadow(0 0 40px #00fff9)'
      }}
      className={animated ? 'pulse' : ''}
    >
      {/* Glass */}
      <path
        d="M 20 10 L 100 10 L 65 70 L 65 110 L 85 120 L 35 120 L 55 110 L 55 70 Z"
        stroke="#00fff9"
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Liquid line */}
      <path
        d="M 35 30 L 85 30"
        stroke="#ff6ec7"
        strokeWidth="3"
        style={{
          filter: 'drop-shadow(0 0 5px #ff6ec7) drop-shadow(0 0 10px #ff6ec7)'
        }}
      />
      {/* Olive */}
      <circle cx="75" cy="25" r="8" stroke="#00ff41" strokeWidth="2" fill="none"
        style={{
          filter: 'drop-shadow(0 0 5px #00ff41) drop-shadow(0 0 10px #00ff41)'
        }}
      />
      {/* Stick */}
      <line x1="75" y1="5" x2="75" y2="35" stroke="#ff9100" strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 0 3px #ff9100)'
        }}
      />
    </svg>
    <NeonTextSign text="Cocktails" color="blue" fontSize="1.8rem" fontFamily="Pacifico" />
  </div>
)

// ============================================
// DINER SIGN WITH ARROW
// ============================================

const DinerSign = () => {
  const [arrowState, setArrowState] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setArrowState(prev => (prev + 1) % 3)
    }, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[0, 1, 2].map(i => (
          <NeonArrow
            key={i}
            color="#ff6ec7"
            size={50}
            animated={false}
            direction="right"
          />
        )).map((arrow, i) => (
          <div
            key={i}
            style={{
              opacity: arrowState >= i ? 1 : 0.15,
              transition: 'opacity 0.1s'
            }}
          >
            {arrow}
          </div>
        ))}
      </div>
      <MountedSign>
        <NeonTextSign text="DINER" color="red" fontSize="3rem" fontFamily="Monoton" />
      </MountedSign>
    </div>
  )
}

// ============================================
// CHASE LIGHTS BORDER
// ============================================

const ChaseLights = ({ color = '#ffea00', count = 12, speed = 100 }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % count)
    }, speed)
    return () => clearInterval(interval)
  }, [count, speed])

  return (
    <div className="chase-lights">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="chase-light"
          style={{
            color,
            opacity: (i === activeIndex || i === (activeIndex + 1) % count || i === (activeIndex + 2) % count) ? 1 : 0.15,
            transition: 'opacity 0.1s'
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// MUSIC NOTE NEON
// ============================================

const MusicNotes = () => (
  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
    {['#ff6ec7', '#00fff9', '#ffea00'].map((color, i) => (
      <svg
        key={i}
        width="40"
        height="60"
        viewBox="0 0 40 60"
        style={{
          filter: `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color})`,
          animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`
        }}
      >
        <ellipse cx="12" cy="48" rx="10" ry="7" stroke={color} strokeWidth="3" fill="none" />
        <line x1="22" y1="48" x2="22" y2="8" stroke={color} strokeWidth="3" />
        <path d="M 22 8 Q 35 12 35 22" stroke={color} strokeWidth="3" fill="none" />
      </svg>
    ))}
  </div>
)

// ============================================
// PALM TREE NEON
// ============================================

const PalmTree = ({ size = 150 }) => (
  <svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 100 120"
    style={{
      filter: 'drop-shadow(0 0 5px #00ff41) drop-shadow(0 0 10px #00ff41) drop-shadow(0 0 25px #00ff41)'
    }}
  >
    {/* Trunk */}
    <path
      d="M 50 120 Q 48 90 52 60 Q 54 50 50 45"
      stroke="#ff9100"
      strokeWidth="4"
      fill="none"
      style={{
        filter: 'drop-shadow(0 0 5px #ff9100) drop-shadow(0 0 10px #ff9100)'
      }}
    />
    {/* Fronds */}
    <path d="M 50 45 Q 30 35 10 50" stroke="#00ff41" strokeWidth="3" fill="none" />
    <path d="M 50 45 Q 25 25 5 30" stroke="#00ff41" strokeWidth="3" fill="none" />
    <path d="M 50 45 Q 40 20 25 10" stroke="#00ff41" strokeWidth="3" fill="none" />
    <path d="M 50 45 Q 60 20 75 10" stroke="#00ff41" strokeWidth="3" fill="none" />
    <path d="M 50 45 Q 75 25 95 30" stroke="#00ff41" strokeWidth="3" fill="none" />
    <path d="M 50 45 Q 70 35 90 50" stroke="#00ff41" strokeWidth="3" fill="none" />
  </svg>
)

// ============================================
// FLAMINGO NEON
// ============================================

const Flamingo = ({ size = 120 }) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 80 110"
    style={{
      filter: 'drop-shadow(0 0 5px #ff6ec7) drop-shadow(0 0 10px #ff6ec7) drop-shadow(0 0 20px #ff6ec7)'
    }}
    className="pulse"
  >
    {/* Body */}
    <ellipse cx="45" cy="50" rx="25" ry="18" stroke="#ff6ec7" strokeWidth="3" fill="none" />
    {/* Neck */}
    <path d="M 30 40 Q 15 25 20 10 Q 25 5 35 8" stroke="#ff6ec7" strokeWidth="3" fill="none" />
    {/* Head */}
    <circle cx="35" cy="8" r="6" stroke="#ff6ec7" strokeWidth="3" fill="none" />
    {/* Beak */}
    <path d="M 40 10 L 50 8 L 42 6" stroke="#ffea00" strokeWidth="2" fill="none"
      style={{ filter: 'drop-shadow(0 0 5px #ffea00)' }}
    />
    {/* Legs */}
    <line x1="40" y1="68" x2="35" y2="105" stroke="#ff6ec7" strokeWidth="2" />
    <line x1="50" y1="68" x2="55" y2="100" stroke="#ff6ec7" strokeWidth="2" />
    {/* Feet */}
    <path d="M 30 105 L 40 105" stroke="#ff6ec7" strokeWidth="2" />
    <path d="M 50 100 L 60 100" stroke="#ff6ec7" strokeWidth="2" />
  </svg>
)

// ============================================
// LIPS NEON (Classic 80s Icon)
// ============================================

const NeonLips = ({ size = 100 }) => (
  <svg
    width={size}
    height={size * 0.5}
    viewBox="0 0 100 50"
    style={{
      filter: 'drop-shadow(0 0 5px #ff1744) drop-shadow(0 0 10px #ff1744) drop-shadow(0 0 20px #ff1744) drop-shadow(0 0 40px #ff1744)'
    }}
    className="pulse"
  >
    {/* Upper lip */}
    <path
      d="M 5 25 Q 25 5 50 15 Q 75 5 95 25"
      stroke="#ff1744"
      strokeWidth="3"
      fill="none"
    />
    {/* Lower lip */}
    <path
      d="M 5 25 Q 50 55 95 25"
      stroke="#ff1744"
      strokeWidth="3"
      fill="none"
    />
  </svg>
)

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  const [masterPower, setMasterPower] = useState(true)
  const [openSign, setOpenSign] = useState(true)
  const [signsState, setSignsState] = useState({
    main: true,
    cocktails: true,
    diner: true,
    music: true
  })

  // Sign turn-on sequence
  const turnOnRef = useRef(null)

  useEffect(() => {
    if (masterPower) {
      // Staggered turn on
      const delays = [0, 300, 600, 900]
      const keys = Object.keys(signsState)

      keys.forEach((key, i) => {
        setTimeout(() => {
          setSignsState(prev => ({ ...prev, [key]: true }))
        }, delays[i])
      })
    } else {
      setSignsState({
        main: false,
        cocktails: false,
        diner: false,
        music: false
      })
    }
  }, [masterPower])

  return (
    <div className="app">
      <NeonFilters />

      {/* Hero Section - Main Sign Display */}
      <section className="hero">
        {/* Ambient glow on wall */}
        <div
          className="ambient-glow ambient-pink"
          style={{
            width: '500px',
            height: '300px',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: masterPower && signsState.main ? 0.3 : 0
          }}
        />

        <div className="hero-content">
          {/* Main Title Sign */}
          <MountedSign>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <NeonTextSign
                text="Coskun"
                color="pink"
                fontSize="clamp(4rem, 12vw, 9rem)"
                fontFamily="Satisfy"
                isOn={signsState.main}
                flickering={true}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <NeonStar color="#ffea00" size={30} />
                <NeonTextSign
                  text="since 1985"
                  color="blue"
                  fontSize="1.2rem"
                  fontFamily="Pacifico"
                  isOn={signsState.main}
                />
                <NeonStar color="#ffea00" size={30} />
              </div>
            </div>
          </MountedSign>

          {/* Decorative Elements */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginTop: '20px' }}>
            <NeonArrow color="#ff6ec7" direction="right" />
            <NeonCircle color="#00fff9" size={60} />
            <NeonArrow color="#ff6ec7" direction="left" />
          </div>

          {/* Power Control */}
          <div style={{ marginTop: '40px' }}>
            <button
              onClick={() => setMasterPower(!masterPower)}
              style={{
                background: 'linear-gradient(180deg, #2a2a2a, #1a1a1a)',
                border: '2px solid #444',
                borderRadius: '8px',
                padding: '15px 30px',
                color: masterPower ? '#00ff41' : '#ff1744',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textShadow: masterPower
                  ? '0 0 5px #00ff41, 0 0 10px #00ff41'
                  : '0 0 5px #ff1744, 0 0 10px #ff1744',
                boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
              }}
            >
              POWER: {masterPower ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </section>

      {/* Signs Gallery */}
      <section className="signs-section">
        <div className="signs-grid">
          {/* Open Sign */}
          <div className="sign-item">
            <OpenSign isOpen={openSign && masterPower} onClick={() => setOpenSign(!openSign)} />
          </div>

          {/* Cocktails Sign */}
          <div className="sign-item">
            <div style={{ opacity: signsState.cocktails && masterPower ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <CocktailSign animated={signsState.cocktails && masterPower} />
            </div>
          </div>

          {/* Diner Sign */}
          <div className="sign-item">
            <div style={{ opacity: signsState.diner && masterPower ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <DinerSign />
            </div>
          </div>

          {/* Music Sign */}
          <div className="sign-item">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              opacity: signsState.music && masterPower ? 1 : 0.2,
              transition: 'opacity 0.5s'
            }}>
              <MusicNotes />
              <NeonTextSign text="Live Music" color="purple" fontSize="2rem" fontFamily="Pacifico" />
            </div>
          </div>

          {/* Palm Tree */}
          <div className="sign-item">
            <div style={{ opacity: masterPower ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <PalmTree size={140} />
            </div>
          </div>

          {/* Flamingo */}
          <div className="sign-item">
            <div style={{ opacity: masterPower ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <Flamingo size={100} />
            </div>
          </div>

          {/* Lips */}
          <div className="sign-item">
            <div style={{ opacity: masterPower ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <NeonLips size={140} />
            </div>
          </div>

          {/* Bar Sign */}
          <div className="sign-item">
            <div style={{ opacity: masterPower ? 1 : 0.2, transition: 'opacity 0.5s' }}>
              <MountedSign>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <NeonStar color="#ffea00" size={35} points={5} />
                  <NeonTextSign text="BAR" color="yellow" fontSize="3rem" fontFamily="Monoton" />
                  <NeonStar color="#ffea00" size={35} points={5} />
                </div>
              </MountedSign>
            </div>
          </div>
        </div>

        {/* Chase Lights */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <ChaseLights color={masterPower ? '#ff6ec7' : '#333'} count={16} speed={80} />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div style={{ opacity: masterPower ? 1 : 0.3, transition: 'opacity 0.5s' }}>
          <NeonTextSign text="Coskun" color="pink" fontSize="2rem" fontFamily="Satisfy" isOn={masterPower} />
        </div>
        <p style={{ marginTop: '20px', color: '#666', fontFamily: 'sans-serif', fontSize: '0.8rem' }}>
          All signs handcrafted with love
        </p>
      </footer>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default App
