'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Zap, Bell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container px-4 mx-auto text-center"
        >
          <Image 
            src="/dormitricity-logo.svg" 
            alt="Dormitricity Logo" 
            width={120} 
            height={120} 
            className="mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {t('home.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300">
            {t('home.subtitle')}
          </p>
          <Button
            size="lg"
            onClick={() => router.push(isAuthenticated() ? '/dashboard' : '/login')}
            className="mx-2"
          >
            {t('home.get_started')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/docs')}
            className="mx-2"
          >
            {t('home.learn_more')}
          </Button>
        </motion.div>
      </section>

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
                  <LineChart className="w-12 h-12 mb-4 text-blue-600" />
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
                  <Bell className="w-12 h-12 mb-4 text-purple-600" />
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
                  <Zap className="w-12 h-12 mb-4 text-yellow-600" />
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

      {/* Docs Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">{t('home.docs.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {t('home.docs.description')}
          </p>
          <Link href="/docs">
            <Button size="lg" variant="outline">
              {t('home.docs.browse')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}