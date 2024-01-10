import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

type State = {
  fullscreenActive: boolean;
  setFullscreenActive: Dispatch<SetStateAction<boolean>>;
};

// --- components ---
const StateContext = createContext<State | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function FullscreenProvider({ children }: Props) {
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const state: State = useMemo(() => {
    return { fullscreenActive, setFullscreenActive };
  }, [fullscreenActive]);

  // Hide the 'back-to-top' button when fullscreen is active.
  useEffect(() => {
    const backToTop: HTMLElement | null =
      document.querySelector('.back-to-top');
    if (!backToTop) return;

    backToTop.style.display = fullscreenActive ? 'none' : 'flex';
  }, [fullscreenActive]);

  return (
    <StateContext.Provider value={state}>{children}</StateContext.Provider>
  );
}

export function useFullscreenState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      'useFullscreenState must be called within a FullscreenProvider',
    );
  }
  return context;
}
