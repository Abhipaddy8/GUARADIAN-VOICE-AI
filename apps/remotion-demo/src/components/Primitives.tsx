import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BRAND, SHADOWS, SPACING, TYPO } from '../lib/styles';

export const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <AbsoluteFill
      style={{
        background: BRAND.gradients.subtle,
        color: BRAND.text.primary,
        fontFamily: TYPO.body.fontFamily
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 20%, rgba(0,102,255,0.12), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,217,160,0.12), transparent 30%)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 60% 80%, rgba(102,126,234,0.12), transparent 35%)',
          mixBlendMode: 'multiply'
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const GlassCard = ({
  children,
  style
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        background: BRAND.gradients.glass,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 24,
        padding: SPACING.xl,
        boxShadow: SHADOWS.lift,
        ...style
      }}
    >
      {children}
    </div>
  );
};

export const Pill = ({ label }: { label: string }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(0,102,255,0.1)',
        color: BRAND.primary,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: BRAND.accent,
          boxShadow: '0 0 12px rgba(0,217,160,0.6)'
        }}
      />
      {label}
    </div>
  );
};

export const LogoMark = ({ name }: { name: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: BRAND.gradients.primary,
          boxShadow: '0 10px 28px rgba(102,126,234,0.4)'
        }}
      />
      <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.text.primary }}>{name}</div>
    </div>
  );
};
