import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { BRAND, SHADOWS, SPACING, TYPO } from '../lib/styles';
import { EASING } from '../lib/anim';

export const MetricCard = ({
  label,
  value,
  delta,
  delay
}: {
  label: string;
  value: string;
  delta: string;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  const y = interpolate(frame - delay, [0, 18], [20, 0], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 18,
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: SHADOWS.soft,
        padding: SPACING.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity,
        transform: `translateY(${y}px)`
      }}
    >
      <div style={{ fontSize: 14, color: BRAND.text.secondary, fontWeight: 600 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: BRAND.text.primary,
          letterSpacing: '-0.02em'
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.accent }}>{delta}</div>
    </div>
  );
};

export const AnimatedLineChart = ({ delay = 0 }: { delay?: number }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 60], [0, 100], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    easing: EASING.subtle
  });
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: SHADOWS.soft,
        padding: SPACING.xl,
        opacity
      }}
    >
      <div
        style={{
          fontSize: 16,
          color: BRAND.text.secondary,
          fontWeight: 600,
          marginBottom: SPACING.md
        }}
      >
        Revenue momentum
      </div>
      <svg viewBox="0 0 400 200" style={{ width: '100%', height: 200 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(102, 126, 234, 0.35)" />
            <stop offset="100%" stopColor="rgba(102, 126, 234, 0)" />
          </linearGradient>
        </defs>
        <path
          d="M 0,150 Q 80,40 160,90 T 320,70 T 400,80"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 - progress * 10}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3))' }}
        />
        <path
          d="M 0,150 Q 80,40 160,90 T 320,70 T 400,80 L 400,200 L 0,200 Z"
          fill="url(#areaGradient)"
          opacity={0.9}
        />
      </svg>
    </div>
  );
};

export const FeatureCard = ({
  title,
  body,
  delay
}: {
  title: string;
  body: string;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  const y = interpolate(frame - delay, [0, 18], [24, 0], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 18,
        border: '1px solid rgba(0,0,0,0.04)',
        padding: SPACING.lg,
        boxShadow: SHADOWS.soft,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity,
        transform: `translateY(${y}px)`
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: 'rgba(0,102,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: BRAND.primary,
          fontWeight: 700
        }}
      >
        ◆
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.text.primary }}>{title}</div>
      <div style={{ fontSize: 18, color: BRAND.text.secondary, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
};

export const StatRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
      <span style={{ color: BRAND.text.secondary }}>{label}</span>
      <span style={{ color: BRAND.text.primary, fontWeight: 600 }}>{value}</span>
    </div>
  );
};

export const DashboardHeader = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.text.primary }}>Overview</div>
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 999,
          background: 'rgba(0,0,0,0.04)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}
      >
        Live
      </div>
    </div>
  );
};

export const SubtleTable = () => {
  return (
    <div
      style={{
        marginTop: SPACING.md,
        display: 'grid',
        gap: 10,
        fontSize: 14,
        color: BRAND.text.secondary
      }}
    >
      <StatRow label="Pipeline" value="$2.4M" />
      <StatRow label="Win rate" value="42%" />
      <StatRow label="Avg. cycle" value="18 days" />
    </div>
  );
};

export const DashboardSidebar = () => {
  return (
    <div
      style={{
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.md,
        padding: SPACING.lg,
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: SHADOWS.soft
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: BRAND.text.secondary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}
      >
        Controls
      </div>
      {['Revenue', 'Pipeline', 'Team', 'Insights'].map((item, index) => (
        <div
          key={item}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            background: index === 0 ? 'rgba(0,102,255,0.1)' : 'transparent',
            color: index === 0 ? BRAND.primary : BRAND.text.secondary,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};
