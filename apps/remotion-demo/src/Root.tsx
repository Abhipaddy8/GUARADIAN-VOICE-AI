import React from 'react';
import { Composition } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { SaaSExplainer } from './SaaSExplainer';

loadFont();

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SaaS60"
        component={SaaSExplainer}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          companyName: 'Lumina',
          heading: 'Turn revenue data into instant action',
          subheading:
            'Your AI dashboard unifies pipeline, product signals, and team performance in one premium control center.',
          cta: 'Ship your fastest quarter yet',
          features: [
            {
              title: 'Autonomous follow-ups',
              body: 'AI-generated sequences that adapt to buyer intent and keep deals moving.'
            },
            {
              title: 'Instant insights',
              body: 'Live summaries that spotlight risk, expansion, and next-best actions.'
            },
            {
              title: 'Revenue orchestration',
              body: 'Align product, success, and sales with shared priorities and alerts.'
            }
          ]
        }}
      />
    </>
  );
};
