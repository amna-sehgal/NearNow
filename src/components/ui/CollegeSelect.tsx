'use client';

import { useState } from 'react';
import { CANONICAL_COLLEGES, OTHER_COLLEGE_OPTION } from '@/lib/constants';

interface CollegeSelectProps {
  value: string;
  onChange: (college: string) => void;
  onOtherValidityChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CollegeSelect({
  value,
  onChange,
  onOtherValidityChange,
  placeholder = 'Select your college',
  disabled = false,
}: CollegeSelectProps) {
  const isCanonical = (CANONICAL_COLLEGES as readonly string[]).includes(value);
  const isCustomStored = Boolean(value && !isCanonical && value !== OTHER_COLLEGE_OPTION);

  // Tracks if user has explicitly chosen "Other" even before typing any custom text
  const [explicitOther, setExplicitOther] = useState(false);
  const [typedCustom, setTypedCustom] = useState('');

  const isOtherActive = explicitOther || isCustomStored;
  const currentSelectValue = isCanonical ? value : isOtherActive ? OTHER_COLLEGE_OPTION : '';
  const currentCustomValue = isCustomStored ? value : typedCustom;

  const handleSelectChange = (newOpt: string) => {
    if (newOpt === OTHER_COLLEGE_OPTION) {
      setExplicitOther(true);
      const textToUse = currentCustomValue.trim();
      onChange(textToUse);
      onOtherValidityChange?.(textToUse.length > 0);
    } else {
      setExplicitOther(false);
      setTypedCustom('');
      onChange(newOpt.trim());
      onOtherValidityChange?.(true);
    }
  };

  const handleCustomChange = (text: string) => {
    setTypedCustom(text);
    const trimmed = text.trim();
    onChange(trimmed);
    onOtherValidityChange?.(trimmed.length > 0);
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={currentSelectValue}
        onChange={e => handleSelectChange(e.target.value)}
        disabled={disabled}
        className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all appearance-none cursor-pointer"
        style={{ background: '#141416', border: '1px solid #2A2A30', color: currentSelectValue ? '#E8E8F0' : '#7A7A8C' }}
        onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
        onBlur={e => { e.target.style.borderColor = '#2A2A30'; e.target.style.boxShadow = 'none'; }}
      >
        <option value="">{placeholder}</option>
        {CANONICAL_COLLEGES.map(c => (
          <option key={c} value={c} style={{ background: '#141416', color: '#E8E8F0' }}>
            {c}
          </option>
        ))}
        <option value={OTHER_COLLEGE_OPTION} style={{ background: '#141416', color: '#C8F135' }}>
          ✨ Other (Enter college manually)
        </option>
      </select>

      {isOtherActive && (
        <div className="flex flex-col gap-1 mt-1">
          <input
            type="text"
            value={currentCustomValue}
            onChange={e => handleCustomChange(e.target.value)}
            placeholder="Type your college or university name..."
            disabled={disabled}
            autoFocus
            className="w-full h-10 px-3 rounded-xl font-body text-sm outline-none transition-all"
            style={{ background: '#18181B', border: '1px solid #3A3A42', color: '#E8E8F0' }}
            onFocus={e => { e.target.style.borderColor = '#C8F135'; e.target.style.boxShadow = '0 0 0 3px rgba(200,241,53,0.06)'; }}
            onBlur={e => { e.target.style.borderColor = '#3A3A42'; e.target.style.boxShadow = 'none'; }}
          />
          <span className="font-mono text-[10px]" style={{ color: '#7A7A8C' }}>
            Enter your college name. It will be added to the Campus discovery map.
          </span>
        </div>
      )}
    </div>
  );
}
