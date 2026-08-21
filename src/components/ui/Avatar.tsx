interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

const colors: Record<string, string> = {
  A: '#1a2a0a', B: '#0a1a2a', C: '#1a0a2a', D: '#2a1a0a',
  E: '#0a2a1a', F: '#1a0a0a', G: '#0a2a2a', H: '#2a0a1a',
  I: '#1a2a1a', J: '#0a0a2a', K: '#2a2a0a', L: '#1a1a0a',
  M: '#0a1a0a', N: '#2a0a0a', O: '#0a2a0a', P: '#1a0a1a',
  R: '#2a1a1a', S: '#0a1a1a', T: '#1a2a2a', default: '#1C1C20'
};

export default function Avatar({ initials, size = 'md', glow }: AvatarProps) {
  const letter = initials[0] || 'U';
  const bg = colors[letter] || colors.default;
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-mono font-medium flex-shrink-0 border border-[#2A2A30]`}
      style={{
        background: bg,
        color: '#C8F135',
        boxShadow: glow ? '0 0 12px rgba(200,241,53,0.2)' : 'none',
      }}
    >
      {initials}
    </div>
  );
}
