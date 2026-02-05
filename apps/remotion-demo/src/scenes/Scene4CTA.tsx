import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, GlassCard, LogoMark, Pill } from '../components/Primitives';
import { BRAND, SPACING } from '../lib/styles';
import { useFadeSlideUp, useScaleFade, useSubtleZoomOut } from '../lib/anim';

export const Scene4CTA = ({ cta, companyName }: { cta: string; companyName: string }) => {
  const titleStyle = useFadeSlideUp(10, 20);
  const subtitleStyle = useFadeSlideUp(24, 20);
  const buttonStyle = useScaleFade(36);
  const zoom = useSubtleZoomOut(120);

  return (
    <Background>
      <AbsoluteFill style={{ padding: SPACING.xxxl, ...zoom, alignItems: 'center', justifyContent: 'center' }}>
        <GlassCard
          style={{
            width: 1200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: SPACING.lg,
            textAlign: 'center'
          }}
        >
          <Pill label="Launch now" />
          <div style={titleStyle}>
            <LogoMark name={companyName} />
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: '-0.02em', ...subtitleStyle }}>
            {cta}
          </div>
          <div
            style={{
              fontSize: 22,
              color: BRAND.text.secondary,
              maxWidth: 760
            }}
          >
            Unlock instant visibility, smarter follow-ups, and a pipeline that runs itself.
          </div>
          <div style={{ marginTop: SPACING.md, ...buttonStyle }}>
            <div
              style={{
                padding: '18px 36px',
                borderRadius: 999,
                background: BRAND.primary,
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: 700,
                boxShadow: '0 14px 30px rgba(0,102,255,0.35)'
              }}
            >
              Book your AI explainer demo
            </div>
          </div>
          <div style={{ fontSize: 16, color: BRAND.text.tertiary }}>
            www.{companyName.toLowerCase()}.com
          </div>
        </GlassCard>
      </AbsoluteFill>
    </Background>
  );
};
