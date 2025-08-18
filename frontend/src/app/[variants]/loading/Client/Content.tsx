import dynamic from 'next/dynamic';
import React, { memo } from 'react';

import FullscreenLoading from '@/components/Loading/FullscreenLoading';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { DatabaseLoadingState } from '@/types/clientDB';

import { CLIENT_LOADING_STAGES } from '../stage';

const InitError = dynamic(() => import('./Error'), { ssr: false });

// Static loading messages to avoid hydration issues
const LOADING_MESSAGES = {
  appIdle: "Ready to start",
  appInitializing: "Application is starting...",
  initAuth: "Initializing authentication service...",
  initUser: "Initializing user status...",
  goToChat: "Loading chat page...",
  initializing: "Initializing database...",
  loadingDependencies: "Initializing dependencies...",
  loadingWasm: "Loading WASM module...",
  migrating: "Performing database migration...",
  finished: "Database initialization completed",
  ready: "Database is ready",
} as const;

interface InitProps {
  setActiveStage: (value: string) => void;
}

const Init = memo<InitProps>(({ setActiveStage }) => {
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB({ onStateChange: setActiveStage });

  return null;
});

interface ContentProps {
  loadingStage: string;
  setActiveStage: (value: string) => void;
}

const Content = memo<ContentProps>(({ loadingStage, setActiveStage }) => {
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);
  const isError = useGlobalStore((s) => s.initClientDBStage === DatabaseLoadingState.Error);

  const stages = CLIENT_LOADING_STAGES.map((key) =>
    LOADING_MESSAGES[key as keyof typeof LOADING_MESSAGES] || "Loading..."
  );

  // Защита от неправильного индекса стадии
  const stageIndex = CLIENT_LOADING_STAGES.indexOf(loadingStage);
  const activeStage = stageIndex >= 0 ? stageIndex : 1; // По умолчанию Initializing

  return (
    <>
      {isPgliteNotInited && <Init setActiveStage={setActiveStage} />}
      <FullscreenLoading
        activeStage={activeStage}
        contentRender={isError && <InitError />}
        stages={stages}
      />
    </>
  );
});

export default Content;
