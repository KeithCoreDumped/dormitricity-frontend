'use client';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import { AnimatePresence, motion } from 'framer-motion';

export default function AnimatedSwap({
  show,
  children,
  fallback,
  duration = 0.18,
}: {
  show: boolean;
  children: React.ReactNode;   // 目标内容（已登录）
  fallback: React.ReactNode;   // 占位/未登录
  duration?: number;
}) {
  return (
    // 外层 layout 可让高度平滑过渡，避免大幅度跳变
    <motion.div layout>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={show ? 'on' : 'off'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration }}
          layout // 让内部高度变化也参与过渡
        >
          {show ? children : fallback}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export function AuthGate({
  children,
  fallback = null,   // 骨架/占位（SSR与CSR初次一致）
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated()); // 仅在客户端读取 localStorage
    setReady(true);
  }, []);

  if (!ready) return fallback;     // 关键：首屏输出与SSR一致
  return <AnimatedSwap show={authed} fallback={fallback}>{children}</AnimatedSwap>;
}
