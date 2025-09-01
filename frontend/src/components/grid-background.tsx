export default function GridBackground() {
  return (
    <div className="absolute inset-y-0 right-0 w-full pointer-events-none overflow-hidden">
      <svg
        className="h-full w-full slide-in-art"
        viewBox="0 0 1200 1600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="g2" cx="30%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g3" cx="80%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="20" edgeMode="duplicate" />
          </filter>
        </defs>

        {/* White background */}
        <rect width="1200" height="1600" fill="#fff" />

        {/* subtle gradient “light pools” */}
        <circle cx="280" cy="220" r="520" fill="url(#g2)" filter="url(#soft)" />
        <circle
          cx="980"
          cy="1240"
          r="480"
          fill="url(#g3)"
          filter="url(#soft)"
        />

        {/* fine grid lines */}
        {/* fine grid lines */}
        <g opacity="0.06">
          {Array.from({ length: 38 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 32}
              y1="0"
              x2={i * 32}
              y2="1600"
              stroke="#0f172a"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 50 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 32}
              x2="1200"
              y2={i * 32}
              stroke="#0f172a"
              strokeWidth="0.5"
            />
          ))}
        </g>
      </svg>
    </div>
  )
}