// Okrugli avatar sa snijegom na vrhu.
export function initials(name) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

export function SnowCap() {
  return (
    <svg className="snowcap" viewBox="0 0 100 44" aria-hidden="true">
      <path
        d="M6 30 Q4 15 20 10 Q32 2 50 4 Q70 2 82 10 Q97 15 94 30 Q90 27 86 31 Q83 41 77 33 Q71 28 65 34 Q61 43 55 35 Q49 30 43 35 Q37 41 33 33 Q27 28 21 34 Q15 39 11 31 Q8 28 6 30 Z"
        fill="#cfe3f5"
        transform="translate(0 3)"
      />
      <path
        d="M6 30 Q4 15 20 10 Q32 2 50 4 Q70 2 82 10 Q97 15 94 30 Q90 27 86 31 Q83 41 77 33 Q71 28 65 34 Q61 43 55 35 Q49 30 43 35 Q37 41 33 33 Q27 28 21 34 Q15 39 11 31 Q8 28 6 30 Z"
        fill="#fff"
      />
      <ellipse cx="34" cy="13" rx="10" ry="3" fill="#fff" opacity="0.9" />
      <circle cx="70" cy="12" r="2" fill="#e8f4ff" />
    </svg>
  );
}

export default function Avatar({ person, size = 56, snow = true, className = '', muted = false }) {
  return (
    <span className={`avatar ${muted ? 'avatar-muted' : ''} ${className}`} style={{ '--size': `${size}px` }}>
      {person.photo !== false ? (
        <img src={`/ljudi/${person.slug}.jpg`} alt="" loading="lazy" draggable="false" />
      ) : (
        <span className="avatar-initials">{initials(person.name)}</span>
      )}
      {snow && <SnowCap />}
    </span>
  );
}
