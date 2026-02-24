const ICON_PATHS = {
  dashboard: (
    <>
      <rect x="3" y="10" width="4" height="10" rx="1" />
      <rect x="10" y="6" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="17" rx="1" />
    </>
  ),
  requests: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  monitoring: (
    <>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </>
  ),
  institutions: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8h14v13" />
      <path d="M8 12h2M8 15h2M14 12h2M14 15h2" />
      <path d="M12 8V5h4v3" />
    </>
  ),
  individuals: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  compliance: (
    <>
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  audit: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8M8 17h5" />
    </>
  ),
  guide: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2" />
      <path d="M18 3v16" />
      <path d="M8 7h6M8 11h6" />
    </>
  ),
  iam: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </>
  ),
  integrations: (
    <>
      <path d="M10 13a5 5 0 0 1 0-7l1.5-1.5a5 5 0 1 1 7 7L17 13" />
      <path d="M14 11a5 5 0 0 1 0 7L12.5 19.5a5 5 0 1 1-7-7L7 11" />
    </>
  ),
  active: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  time: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M9 3h6" />
      <path d="M12 13h4" />
    </>
  ),
  banking: (
    <>
      <path d="M3 10h18" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M2 10 12 4l10 6" />
      <path d="M3 20h18" />
    </>
  ),
  securities: (
    <>
      <path d="M4 19h16" />
      <path d="m6 15 4-4 3 3 5-6" />
      <path d="m18 8h-4V4" />
    </>
  ),
  insurance: (
    <>
      <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
      <path d="M12 8v8" />
      <path d="M8.5 12h7" />
    </>
  ),
  mpf: (
    <>
      <path d="M3 19h18" />
      <path d="M6 19V9h12v10" />
      <path d="M9 9V6h6v3" />
    </>
  ),
  crossSector: (
    <>
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="18" cy="17" r="2" />
      <path d="M8 12h8M16.5 8.5 8 11M16.5 15.5 8 13" />
    </>
  ),
};

export default function ProfessionalIcon({ name, size = 18, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name] || ICON_PATHS.requests}
    </svg>
  );
}