'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Chart } from '@/prisma/generated/client';

interface ChartsContextType {
  charts: Chart[];
  favorites: Chart[];
  openCharts: Chart[];
  activeTab: number;
  setCharts: (charts: Chart[]) => void;
  toggleFavorite: (chart: Chart) => void;
  openChart: (chart: Chart) => void;
  closeChart: (id: string) => void;
  setActiveTab: (index: number) => void;
}

const ChartsContext = createContext<ChartsContextType | undefined>(undefined);

export const ChartsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [favorites, setFavorites] = useState<Chart[]>([]);
  const [openCharts, setOpenCharts] = useState<Chart[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const saved = Cookies.get('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (chart: Chart) => {
    setFavorites(prev => {
      const next = prev.some(c => c.id === chart.id) ? prev.filter(c => c.id !== chart.id) : [...prev, chart];
      Cookies.set('favorites', JSON.stringify(next));
      return next;
    });
  };

  const openChart = (chart: Chart) => {
    setOpenCharts(prev => {
      const exists = prev.find(c => c.id === chart.id);
      const next = exists ? prev : [...prev, chart];
      setActiveTab(next.findIndex(c => c.id === chart.id));
      return next;
    });
  };

  const closeChart = (id: string) => {
    setOpenCharts(prev => {
      const next = prev.filter(c => c.id !== id);
      setActiveTab(Math.max(0, Math.min(activeTab, next.length - 1)));
      return next;
    });
  };

  return (
    <ChartsContext.Provider value={{
      charts,
      favorites,
      openCharts,
      activeTab,
      setCharts,
      toggleFavorite,
      openChart,
      closeChart,
      setActiveTab,
    }}>
      {children}
    </ChartsContext.Provider>
  );
};

export const useCharts = () => {
  const context = useContext(ChartsContext);
  if (!context) throw new Error('useCharts must be used within ChartsProvider');
  return context;
};
