'use client';

import { useMemo, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  Variants,
} from 'framer-motion';
import { SubsCard } from '@/components/subs/SubsCard';
import { AddSubCard } from '@/components/subs/AddSubCard';
import { NotifySetting } from '@/components/subs/NotifySetting';
import { useTranslation } from 'react-i18next';
import { SeriesChart } from '@/components/charts/SeriesChart';
import { buildDemoHistory, buildDemoSubscriptions } from '@/lib/demoSamples';
import "./styles.css";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function useParallax(value: ReturnType<typeof useScroll>['scrollYProgress'], distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function ParallaxWrapper({ children, header }: { children: React.ReactNode; header?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 400);

  return (
    <section className="min-h-screen flex items-center pl-6 relative perspective-[500px] snap-center">
      <div ref={ref} className="w-[70vw] h-[80vh] max-h-[90vh] mx-5 overflow-hidden flex flex-col items-start justify-center relative">
        {children}
      </div>
      <motion.h2 style={{ y }} className="absolute left-1/2 translate-x-[130px] text-6xl leading-tight">
        {header}
      </motion.h2>
    </section>
  );
}

function Image({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 400);

  return (
    <>
      <div ref={ref} className="w-[70vw] h-[80vh] max-h-[90vh] mx-5 overflow-hidden flex items-center justify-center">
        <div className="h-[400px] bg-gray-300 flex items-center justify-center text-2xl text-gray-700">
          Image #{id} Placeholder
        </div>
      </div>
      <motion.h2 style={{ y }} className="absolute left-1/2 translate-x-[130px] text-6xl leading-tight">
        #00{id}
      </motion.h2>
    </>
  );
}

function HeroSection() {
  return (
    <section className="min-h-[100svh] grid place-items-center text-center relative px-6 snap-center">
      <motion.h1
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3"
      >
        Parallax Demo
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="text-base md:text-lg"
      >
        第一屏是静态标题，不随滚动而移动
      </motion.p>
    </section>
  );
}

export default function ParallaxPage() {
  const { t } = useTranslation();
  const demoSubs = useMemo(() => buildDemoSubscriptions(), []);
  const demoHistory = useMemo(() => buildDemoHistory(), []);
  return (
    <>
      <HeroSection />
      <ParallaxWrapper header="这是一个标题">
        <motion.div className="container px-4 mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-3 pointer-events-none">
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <SubsCard sub={demoSubs[0]!} onChanged={() => null} onSubDeleted={() => null} />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <SubsCard sub={demoSubs[1]!} onChanged={() => null} onSubDeleted={() => null} />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <AddSubCard onSubAdded={() => null} />
          </motion.div>
        </motion.div>
      </ParallaxWrapper>
      {/* {[1, 2, 3, 4, 5].map((n) => (
        <ParallaxWrapper>
          <Image key={n} id={`${n}`} />
        </ParallaxWrapper>
      ))} */}
      <ParallaxWrapper header={<span>sdfsdfsfd</span>}>
        <div className="w-[40vw] h-[80vh] bg-white p-4 rounded-lg shadow-md font-base justify-center flex items-center">
          <NotifySetting sub={demoSubs[0]!} onSubDeleted={() => null} onSuccess={() => null} />
        </div>
      </ParallaxWrapper>
      <ParallaxWrapper header="这是一个标题">
        <SeriesChart
          data={demoHistory.slice(0, 500)}
          label={t('series.power_label')}
          unit="kW"
          stroke="var(--color-kw)"
        />
      </ParallaxWrapper>
    </>
  );
}
