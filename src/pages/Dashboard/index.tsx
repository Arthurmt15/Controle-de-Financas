/**
 * @file pages/Dashboard/index.tsx
 * @description Página principal do Dashboard.
 * Wrapper fino — todo layout/visual vive em components/features/Dashboard (shadcn+tailwind).
 */

import React from 'react';
import DashboardComponent from '../../components/features/Dashboard';

/** Página do Dashboard */
const DashboardPage: React.FC = () => {
  // Sem Container styled — DashboardComponent já traz max-w e padding bento
  return <DashboardComponent />;
};

export default DashboardPage;
