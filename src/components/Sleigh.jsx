// Djed Božićnjak u saonicama s dva sobova. `passenger` je element (avatar)
// koji sjedi u saonicama iza Djeda.

function Reindeer({ x, y, lead }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="leg leg-back">
        <path d="M22 44 L8 54 L-1 52" stroke="#7a5034" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="leg leg-front">
        <path d="M58 45 L72 55 L80 52" stroke="#7a5034" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <ellipse cx="12" cy="33" rx="6" ry="4" fill="#f4f1ea" />
      <ellipse cx="40" cy="40" rx="28" ry="12.5" fill="#9a6a45" />
      <ellipse cx="40" cy="46" rx="19" ry="5.5" fill="#c79d74" />
      <path d="M58 36 Q66 22 71 14 L81 19 Q75 30 67 43 Z" fill="#9a6a45" />
      <ellipse cx="80" cy="17" rx="11" ry="7" fill="#9a6a45" transform="rotate(-12 80 17)" />
      <ellipse cx="89" cy="20" rx="6" ry="4.6" fill="#b4835b" />
      <path d="M72 11 Q66 6 64 12 Q68 14 72 13 Z" fill="#7a5034" />
      <path d="M76 9 Q73 -2 64 -6 M72 1 L66 -2 M74 -1 Q78 -10 86 -12 M78 -5 L84 -4" stroke="#5e3f27" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M80 8 Q82 -2 92 -4 M85 0 L90 2" stroke="#5e3f27" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="82.5" cy="14.5" r="1.5" fill="#1d130c" />
      {lead ? (
        <>
          <circle cx="94" cy="20" r="9" fill="#ff4d4d" opacity="0.25" className="nose-glow" />
          <circle cx="94" cy="20" r="3.6" fill="#ff3b3b" />
        </>
      ) : (
        <circle cx="94" cy="20" r="2.8" fill="#2d1c10" />
      )}
      {/* orma */}
      <path d="M50 28 Q46 40 50 52" stroke="#c1121f" strokeWidth="4" fill="none" />
      <circle cx="50" cy="54" r="3.4" fill="#ffd166" />
      <path d="M64 30 Q70 34 74 28" stroke="#c1121f" strokeWidth="3" fill="none" />
      {/* noge u drugom planu */}
      <g className="leg leg-back2">
        <path d="M26 46 L18 58 L10 60" stroke="#6a452c" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="leg leg-front2">
        <path d="M54 47 L62 60 L71 62" stroke="#6a452c" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export default function Sleigh({ passenger, className = '', style }) {
  return (
    <div className={`sleigh ${className}`} style={style}>
      <svg viewBox="0 0 400 150" className="sleigh-svg" aria-hidden="true">
        {/* uzde */}
        <path d="M120 62 Q170 60 218 80" stroke="#ffd166" strokeWidth="1.6" fill="none" />
        <path d="M120 62 Q230 38 330 68" stroke="#ffd166" strokeWidth="1.6" fill="none" />
        <path d="M232 78 Q270 82 300 72" stroke="#c1121f" strokeWidth="2.4" fill="none" />

        <Reindeer x={170} y={40} />
        <Reindeer x={282} y={30} lead />

        {/* vreća s poklonima */}
        {!passenger && (
          <g>
            <rect x="22" y="22" width="14" height="14" rx="2" fill="#009FE3" transform="rotate(-12 29 29)" />
            <rect x="36" y="16" width="12" height="16" rx="2" fill="#A9CF3A" transform="rotate(10 42 24)" />
            <path d="M14 66 Q6 34 28 30 Q46 26 52 44 L54 68 Z" fill="#8a5a33" />
            <path d="M24 34 Q34 40 46 34" stroke="#6b4426" strokeWidth="3" fill="none" />
          </g>
        )}

        {/* Djed */}
        <path d="M60 82 Q56 42 80 35 Q101 32 107 52 L111 82 Z" fill="#d62839" />
        <path d="M78 36 Q74 52 78 82" stroke="#f4f1ea" strokeWidth="5" fill="none" />
        <rect x="62" y="64" width="48" height="7" fill="#1b1b1b" />
        <rect x="80" y="63" width="10" height="9" rx="1.5" fill="none" stroke="#ffd166" strokeWidth="2" />
        <path d="M96 48 Q110 52 118 60" stroke="#d62839" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="120" cy="61" r="5.6" fill="#2f7d32" />
        <circle cx="92" cy="26" r="10.5" fill="#f6c9a6" />
        <path d="M81 25 Q82 47 93 48 Q105 46 103 27 Q98 34 92 34 Q86 33 81 25 Z" fill="#fff" />
        <ellipse cx="96" cy="31" rx="6" ry="2.6" fill="#fff" />
        <circle cx="100" cy="27" r="2.6" fill="#e89a85" />
        <circle cx="95.5" cy="22" r="1.3" fill="#2a1a12" />
        <path d="M80 21 Q83 6 96 8 Q105 10 103 20 Z" fill="#d62839" />
        <path d="M84 12 Q72 2 62 12" stroke="#d62839" strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="61" cy="14" r="5" fill="#fff" />
        <rect x="79" y="17" width="26" height="7" rx="3.5" fill="#fff" />

      </svg>
      {passenger && <div className="sleigh-passenger">{passenger}</div>}
      <svg viewBox="0 0 400 150" className="sleigh-svg" aria-hidden="true">
        {/* saonice */}
        <path d="M6 60 Q8 98 40 100 L132 100 Q152 98 154 80 L152 56 Q142 70 122 70 L30 70 Q18 68 6 60 Z" fill="#c1121f" stroke="#ffd166" strokeWidth="3" strokeLinejoin="round" />
        <path d="M34 84 Q48 74 62 84 T90 84 T118 84" stroke="#ffd166" strokeWidth="2" fill="none" />
        <path d="M18 108 L150 108 Q174 108 174 90 Q174 79 163 81" stroke="#ffd166" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M40 100 v8 M124 100 v8" stroke="#ffd166" strokeWidth="3.5" />
        <path d="M8 62 Q30 58 40 66 Q60 58 80 66 Q100 58 120 66 Q140 58 152 56" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
