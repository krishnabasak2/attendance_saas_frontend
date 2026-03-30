interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

// Deterministic colour based on the first character of the name
const COLOURS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-sky-500',
  'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  'bg-teal-500', 'bg-pink-500',
];

function colourFor(name: string) {
  return COLOURS[(name.charCodeAt(0) || 0) % COLOURS.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({ src, name, size = 'sm' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} flex-shrink-0 rounded-full object-cover ring-2 ring-white`}
        onError={(e) => {
          // Fall back to initials on broken image
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute('style');
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${colourFor(name)} flex flex-shrink-0 items-center justify-center
        rounded-full font-semibold text-white ring-2 ring-white`}
    >
      {initials(name)}
    </div>
  );
}
