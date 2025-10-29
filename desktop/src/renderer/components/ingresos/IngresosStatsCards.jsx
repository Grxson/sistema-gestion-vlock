import React from 'react';
import StatCard from '../ui/StatCard';
import { BanknotesIcon, ChartBarIcon, ArrowTrendingUpIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

export default function IngresosStatsCards({ stats }) {
  const {
    total_ingresos = 0,
    ingresos_mes_actual = 0,
    ingresos_mes_anterior = 0,
    variacion_mes = 0,
  } = stats || {};

  const currency = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Ingresos"
        value={currency(total_ingresos)}
        icon={BanknotesIcon}
        trend={null}
        subtitle="Acumulado"
      />
      <StatCard
        title="Mes Actual"
        value={currency(ingresos_mes_actual)}
        icon={ChartBarIcon}
        trend={null}
        subtitle="Ingresos del mes"
      />
      <StatCard
        title="Mes Anterior"
        value={currency(ingresos_mes_anterior)}
        icon={PresentationChartLineIcon}
        trend={null}
        subtitle="Comparativa"
      />
      <StatCard
        title="Variación %"
        value={`${Number(variacion_mes).toFixed(2)}%`}
        icon={ArrowTrendingUpIcon}
        trend={variacion_mes > 0 ? 'up' : variacion_mes < 0 ? 'down' : 'flat'}
        trendValue={Number(variacion_mes).toFixed(2)}
        trendLabel="vs mes anterior"
        subtitle="Vs. mes anterior"
      />
    </div>
  );
}
