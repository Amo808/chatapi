import React, { memo } from 'react';

import FullscreenLoading from '@/components/Loading/FullscreenLoading';

import { AppLoadingStage, SERVER_LOADING_STAGES } from '../stage';

// Static loading messages to avoid hydration issues
const LOADING_MESSAGES = {
  appIdle: "Ready to start",
  appInitializing: "Application is starting...",
  initAuth: "Initializing authentication service...",
  initUser: "Initializing user status...",
  goToChat: "Loading chat page...",
} as const;

interface ContentProps {
  loadingStage: AppLoadingStage;
}

const Content = memo<ContentProps>(({ loadingStage }) => {
  const activeStage = SERVER_LOADING_STAGES.indexOf(loadingStage);
  const stages = SERVER_LOADING_STAGES.map((key) => 
    LOADING_MESSAGES[key as keyof typeof LOADING_MESSAGES] || "Loading..."
  );

  return <FullscreenLoading activeStage={activeStage} stages={stages} />;
});

export default Content;
