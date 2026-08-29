import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMode } from '../types';

const CHAVE_MODO = '@medalerta:app_mode';
const CHAVE_MODO_FACIL = '@medalerta:modo_facil';

interface AppModeContextData {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  modoFacil: boolean;
  setModoFacil: (value: boolean) => Promise<void>;
  isLoading: boolean;
}

const AppModeContext = createContext<AppModeContextData>({ mode: null, setMode: async () => {}, modoFacil: false, setModoFacil: async () => {}, isLoading: true });

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(null);
  const [modoFacil, setModoFacilState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(CHAVE_MODO), AsyncStorage.getItem(CHAVE_MODO_FACIL)]).then(([valor, facil]) => {
      setModeState(valor as AppMode);
      setModoFacilState(facil === 'true');
      setIsLoading(false);
    });
  }, []);

  async function setMode(newMode: AppMode) {
    if (newMode) await AsyncStorage.setItem(CHAVE_MODO, newMode); else await AsyncStorage.removeItem(CHAVE_MODO);
    setModeState(newMode);
  }

  async function setModoFacil(value: boolean) {
    await AsyncStorage.setItem(CHAVE_MODO_FACIL, String(value));
    setModoFacilState(value);
  }

  return <AppModeContext.Provider value={{ mode, setMode, modoFacil, setModoFacil, isLoading }}>{children}</AppModeContext.Provider>;
}

export function useAppMode() { return useContext(AppModeContext); }
