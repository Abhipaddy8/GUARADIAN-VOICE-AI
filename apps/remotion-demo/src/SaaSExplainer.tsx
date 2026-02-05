import React from 'react';
import { Audio } from 'remotion';
import { TransitionSeries, fade, linearTiming } from '@remotion/transitions';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Dashboard } from './scenes/Scene2Dashboard';
import { Scene3Features } from './scenes/Scene3Features';
import { Scene4CTA } from './scenes/Scene4CTA';

export type ExplainerProps = {
  companyName: string;
  heading: string;
  subheading: string;
  cta: string;
  features: { title: string; body: string }[];
  voiceoverSrc?: string;
  musicSrc?: string;
};

export const SaaSExplainer = (props: ExplainerProps) => {
  return (
    <>
      {props.voiceoverSrc ? <Audio src={props.voiceoverSrc} volume={1} /> : null}
      {props.musicSrc ? <Audio src={props.musicSrc} volume={0.2} /> : null}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={420}>
          <Scene1Hook heading={props.heading} subheading={props.subheading} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={630}>
          <Scene2Dashboard />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={420}>
          <Scene3Features features={props.features} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />

        <TransitionSeries.Sequence durationInFrames={420}>
          <Scene4CTA cta={props.cta} companyName={props.companyName} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
