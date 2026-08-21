interface TagProps {
  label: string;
  variant?: 'default' | 'volt' | 'dim';
}

export default function Tag({ label, variant = 'default' }: TagProps) {
  const styles = {
    default: 'bg-[#1C1C20] text-[#7A7A8C] border border-[#2A2A30]',
    volt: 'bg-[#1a2a0a] text-[#C8F135] border border-[#C8F135]/20',
    dim: 'bg-[#1C1C20] text-[#9BB82A] border border-[#9BB82A]/20',
  };
  return (
    <span className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {label}
    </span>
  );
}
