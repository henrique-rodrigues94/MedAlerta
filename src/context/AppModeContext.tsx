import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode } from '../types';

const CHAVE_MODO = '@medalerta:app_mode';

interface AppModeContextData {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  isLoading: boolean;
}

const AppModeContext = createContext<AppModeContextData>({
  mode: null,
  setMode: async () => {},
  isLoading: true,
});

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_MODO).then((valor) => {
      setModeState(valor as AppMode);
      setIsLoading(false);
    });
  }, []);

  async function setMode(newMode: AppMode) {
    if (newMode) {
      await AsyncStorage.setItem(CHAVE_MODO, newMode);
    } else {
      await AsyncStorage.removeItem(CHAVE_MODO);
    }
    setModeState(newMode);
  }

  return (
    <AppModeContext.Provider value={{ mode, setMode, isLoading }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
