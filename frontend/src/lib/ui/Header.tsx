'use client';

import * as React from 'react';
import { HiChevronLeft } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  /** Center title text */
  title: string;
  /** Show the back button (defaults to true) */
  showBack?: boolean;
  /** Optional custom back handler (falls back to router.back()) */
  onBack?: () => void;
  /** Optional right-side content (e.g., action button) */
  right?: React.ReactNode;
  /** Extra classes for the root container */
  className?: string;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  right,
  className,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  return (
    <div
      className={cn(
        'relative h-14 border-b border-gray-300 bg-white flex items-center',
        className
      )}
    >
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="text-gray-700 hover:text-black"
        >
          <HiChevronLeft className="w-10 h-10" aria-hidden="true" />
        </button>
      )}

      <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-semibold text-gray-800">
        {title}
      </h1>

      {right ? <div className="ml-auto">{right}</div> : null}
    </div>
  );
};

export default Header;
