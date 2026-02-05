import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, Pill } from '../components/Primitives';
import { BRAND, SPACING, TYPO } from '../lib/styles';
import { useFadeSlideUp, useWipeIn, useSubtleZoomOut } from '../lib/anim';

export const Scene1Hook = ({
  heading,
  subheading
}: {
  heading: string;
  subheading: string;
}) => {
  const frame = useCurrentFrame();
  const headingMask = useWipeIn(10, 28, 'left');
  const subStyle = useFadeSlideUp(26, 20);
  const zoom = useSubtleZoomOut(120);

  return (
    <Background>
      <AbsoluteFill style={{ padding: SPACING.xxxl, ...zoom }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.lg }}>
          <Pill label="B2B SaaS momentum" />
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              fontWeight: TYPO.heading.fontWeight,
              letterSpacing: TYPO.heading.letterSpacing,
              maxWidth: 1200,
              ...headingMask
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.4,
              color: BRAND.text.secondary,
              maxWidth: 900,
              ...subStyle
            }}
          >
            {subheading}
          </div>
          <div style={{ display: 'flex', gap: SPACING.md, marginTop: SPACING.xl }}>
            {['Manual updates', 'Slow insights', 'Missed revenue'].map((item, index) => {
              const style = useFadeSlideUp(46 + index * 6, 16);
              return (
                <div
                  key={item}
                  style={{
                    padding: '14px 20px',
                    borderRadius: 14,
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.05)',
                    color: BRAND.text.secondary,
                    fontWeight: 600,
                    fontSize: 18,
                    ...style
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
