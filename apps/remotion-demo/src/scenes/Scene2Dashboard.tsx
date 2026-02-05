import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, GlassCard, Pill } from '../components/Primitives';
import {
  AnimatedLineChart,
  DashboardHeader,
  DashboardSidebar,
  MetricCard,
  SubtleTable
} from '../components/Dashboard';
import { BRAND, SPACING } from '../lib/styles';
import { useFadeSlideUp, useScaleFade, useSubtleZoomOut } from '../lib/anim';

export const Scene2Dashboard = () => {
  const titleStyle = useFadeSlideUp(10, 20);
  const subtitleStyle = useFadeSlideUp(24, 20);
  const zoom = useSubtleZoomOut(120);

  return (
    <Background>
      <AbsoluteFill style={{ padding: SPACING.xxxl, ...zoom }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Pill label="Live dashboard" />
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginTop: SPACING.sm,
                  ...titleStyle
                }}
              >
                One view for every signal
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: BRAND.text.secondary,
                  marginTop: SPACING.sm,
                  maxWidth: 820,
                  ...subtitleStyle
                }}
              >
                Replace static reports with a living, real-time command center.
              </div>
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 14,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.05)',
                color: BRAND.text.secondary,
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Updated moments ago
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: SPACING.xl }}>
            <DashboardSidebar />
            <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: SPACING.lg }}>
              <DashboardHeader />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SPACING.lg }}>
                {[
                  { label: 'Net revenue', value: '$1.28M', delta: '+18.4% MoM' },
                  { label: 'Active accounts', value: '2,140', delta: '+9.2% QoQ' },
                  { label: 'Renewals', value: '94%', delta: '+6.1% YoY' }
                ].map((metric, index) => {
                  const style = useScaleFade(30 + index * 8);
                  return (
                    <div key={metric.label} style={style}>
                      <MetricCard {...metric} delay={0} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: SPACING.lg }}>
                <AnimatedLineChart delay={40} />
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 20,
                    border: '1px solid rgba(0,0,0,0.04)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    padding: SPACING.lg
                  }}
                >
                  <div style={{ fontSize: 16, color: BRAND.text.secondary, fontWeight: 600 }}>
                    Team activity
                  </div>
                  <div
                    style={{
                      marginTop: SPACING.md,
                      display: 'flex',
                      gap: 10
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          boxShadow: '0 6px 18px rgba(102,126,234,0.25)'
                        }}
                      />
                    ))}
                  </div>
                  <SubtleTable />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
