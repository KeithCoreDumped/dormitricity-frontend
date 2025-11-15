'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Zap, Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { SubsCard } from "@/components/subs/SubsCard";
import { AddSubCard } from '@/components/subs/AddSubCard';
import { Subscription } from '@/lib/types';
import { SeriesChart } from '@/components/charts/SeriesChart';
import { testData, testSubs } from '@/lib/testData';

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const gridStagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  // 子元素卡片的入场动效
  const cardVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container px-4 mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src="/dormitricity-logo.svg"
              alt="Dormitricity Logo"
              width={140}
              height={140}
              className="mx-auto mb-8 drop-shadow-lg"
            />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
            {t('home.title')}
          </h1>
          <p className="text-xl md:text-3xl mb-12 text-gray-700 dark:text-gray-200 max-w-3xl mx-auto font-light">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push(isAuthenticated() ? '/dashboard' : '/login')}
              className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
            >
              {t('home.get_started')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/docs')}
              className="text-lg px-8 py-6"
            >
              {t('home.learn_more')}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {t('home.stats.update_frequency')}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Real-time monitoring
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {t('home.stats.notification_channels')}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Flexible alerts
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {t('home.stats.max_subscriptions')}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Multi-room support
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="pt-6">
                  <LineChart className="w-12 h-12 mb-4 text-emerald-600" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t('home.features.monitoring.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('home.features.monitoring.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="pt-6">
                  <Bell className="w-12 h-12 mb-4 text-teal-600" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t('home.features.notifications.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('home.features.notifications.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="pt-6">
                  <Zap className="w-12 h-12 mb-4 text-cyan-600" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t('home.features.prediction.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('home.features.prediction.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Demo Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.demo.dashboard_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.demo.dashboard_description')}
            </p>
          </motion.div>
          <motion.div
            variants={gridStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pointer-events-none"
          >
            <motion.div variants={cardVariants as unknown as Variants}>
              <SubsCard sub={testSubs[0] as Subscription} onChanged={() => null} onSubDeleted={() => null} />
            </motion.div>
            <motion.div variants={cardVariants as unknown as Variants}>
              <SubsCard sub={testSubs[1] as Subscription} onChanged={() => null} onSubDeleted={() => null} />
            </motion.div>
            <motion.div variants={cardVariants as unknown as Variants}>
              <AddSubCard onSubAdded={() => null} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Chart Demo Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.demo.chart_title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.demo.chart_description')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <SeriesChart
              data={testData.points.slice(0, 500).map(({ ts, kwh }) => ({ ts, pt: kwh }))}
              label={t('series.power_label')}
              unit="kW"
              stroke="var(--color-kw)"
            />
          </motion.div>
        </div>
      </section>

      {/* Docs Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
              {t('home.docs.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              {t('home.docs.description')}
            </p>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                {t('home.docs.browse')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 Dormitricity. Monitor your dorm&apos;s energy with ease.</p>
        </div>
      </footer>
    </div>
  );
}