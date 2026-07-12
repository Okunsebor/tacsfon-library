import React from 'react';

interface ReaderToolbarProps {
  scrollProgress: number;
  borderColor: string;
  accent: string;
}

/**
 * Top reading progress bar component.
 */
export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  scrollProgress,
  borderColor,
  accent
}) => {
  return (
    <div className="h-[3px] w-full shrink-0 relative" style={{ background: borderColor }}>
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background: `linear-gradient(90deg, ${accent}, #00FF88)`
        }}
      />
    </div>
  );
};
