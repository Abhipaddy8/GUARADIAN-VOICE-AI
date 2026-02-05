import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, Pill } from '../components/Primitives';
import { FeatureCard } from '../components/Dashboard';
import { BRAND, SPACING } from '../lib/styles';
import { useFadeSlideUp, useSubtleZoomOut } from '../lib/anim';

export const Scene3Features = ({ features }: { features: { title: string; body: string }[] }) => {
  const titleStyle = useFadeSlideUp(10, 20);
  const subtitleStyle = useFadeSlideUp(24, 20);
  const zoom = useSubtleZoomOut(120);

  return (
    <Background>
      <AbsoluteFill style={{ padding: SPACING.xxxl, ...zoom }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xl }}>
          <Pill label="AI workstreams" />
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              maxWidth: 1100,
              ...titleStyle
            }}
          >
            Automations that feel hand-built
          </div>
          <div
            style={{
              fontSize: 28,
              color: BRAND.text.secondary,
              maxWidth: 900,
              ...subtitleStyle
            }}
          >
            Every workflow adapts to your revenue team and surfaces the next best action.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SPACING.lg }}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                body={feature.body}
                delay={40 + index * 8}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
