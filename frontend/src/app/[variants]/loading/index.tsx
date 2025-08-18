'use client';

import dynamic from 'next/dynamic';
import React, { memo, useEffect, useState } from 'react';
import { Center } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';

// Простой статический компонент для серверной отрисовки
const StaticLoading = () => (
  <Center height="100vh" style={{ fontSize: '16px', color: '#666' }}>
    <ProductLogo size={48} type={'combine'} />
  </Center>
);

// Динамически загружаем Client компонент, чтобы избежать гидратации
const ClientMode = dynamic(
  () => import('./Client'),
  {
    ssr: false,
    loading: StaticLoading,
  }
);

const ScreenLoading = memo(() => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Серверная отрисовка: простой статический контент
    return <StaticLoading />;
  }

  // Клиентская отрисовка: полный функционал
  return <ClientMode />;
});

ScreenLoading.displayName = 'ScreenLoading';

export default ScreenLoading;
