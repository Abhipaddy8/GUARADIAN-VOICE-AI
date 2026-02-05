import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const EASING = {
  easeOut: Easing.bezier(0.16, 1, 0.3, 1),
  easeIn: Easing.bezier(0.7, 0, 0.84, 0),
  easeInOut: Easing.bezier(0.87, 0, 0.13, 1),
  subtle: Easing.bezier(0.4, 0, 0.2, 1)
};

export const useFadeSlideUp = (delay = 0, duration = 20) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  const y = interpolate(frame - delay, [0, duration], [40, 0], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  return { opacity, transform: `translateY(${y}px)` };
};

export const useScaleFade = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 120 }
  });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateRight: 'clamp'
  });
  return { opacity, transform: `scale(${scale})` };
};

export const useBlurFade = (delay = 0) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    easing: EASING.subtle
  });
  const blur = interpolate(frame - delay, [0, 20], [16, 0], {
    extrapolateRight: 'clamp',
    easing: EASING.subtle
  });
  return { opacity, filter: `blur(${blur}px)` };
};

export const useWipeIn = (delay = 0, duration = 25, direction: 'left' | 'right' = 'left') => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, duration], [0, 100], {
    extrapolateRight: 'clamp',
    easing: EASING.easeInOut
  });
  const clipPath =
    direction === 'left'
      ? `inset(0 ${100 - progress}% 0 0)`
      : `inset(0 0 0 ${100 - progress}%)`;
  return { clipPath };
};

export const useSubtleZoomOut = (duration = 90) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1.04, 1], {
    extrapolateRight: 'clamp',
    easing: EASING.easeOut
  });
  return { transform: `scale(${scale})` };
};
