import React, { useState } from 'react';
import { DayOfWeekStat, DailyStat } from '../types/sales';
import { formatCurrency } from '../utils/analytics';
import { Calendar, Clock } from 'lucide-react';

interface DayOfWeekHeatmapProps {
  dayOfWeekStats: DayOfWeekStat[];
  dailyStats: DailyStat[];
}

export const DayOfWeekHeatmap: React.FC<DayOfWeekHeatmapProps> = ({
  dayOfWeekStats,
  dailyStats
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyStat | null>(null);

  const maxDowRev = Math.max(...dayOfWeekStats.map((d) => d.revenue), 1);
  const maxDailyRev = Math.max(...dailyStats.map((d) => d.revenue), 1);

  // Group daily stats by month for the calendar view
  // August 2025, September 2025, October 2025
  const dailyMap = new Map<string, DailyStat>();
  dailyStats.forEach((d) => dailyMap.set(d.date, d));

  const getHeatmapColor = (revenue: number) => {
    if (revenue === 0) return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/60';
    const ratio = revenue / maxDailyRev;
    if (ratio < 0.25) return 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 text-indigo-900';
    if (ratio < 0.5) return 'bg-indigo-300 dark:bg-indigo-800/80 border-indigo-400 text-indigo-900';
    if (ratio < 0.75) return 'bg-indigo-500 dark:bg-indigo-600 border-indigo-600 text-white';
    return 'bg-indigo-700 dark:bg-indigo-500 border-indigo-700 text-white font-bold';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors space-y-6">
      {/* Day of Week Distribution */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Day-of-Week Revenue Rhythm
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sales performance aggregated by day of the week (Monday – Sunday)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayOfWeekStats.map((item) => {
            const heightPercent = (item.revenue / maxDowRev) * 100;
            return (
              <div
                key={item.dayName}
                className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {item.dayName}
                </span>

                {/* Vertical Bar Column */}
                <div className="w-full h-24 flex items-end justify-center my-2">
                  <div
                    className="w-full max-w-[28px] bg-indigo-600 dark:bg-indigo-500 rounded-t-md transition-all duration-300 hover:bg-indigo-700"
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    title={`${item.dayName}: ${formatCurrency(item.revenue)} (${item.units} items)`}
                  />
                </div>

                <div className="text-center font-mono tabular-nums text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {formatCurrency(item.revenue)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.units} units
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Activity Heatmap */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Sales Activity Calendar Heatmap
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily revenue intensity from August 15 through October 07, 2025
            </p>
          </div>

          {/* Intensity Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Low</span>
            <div className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <div className="w-3 h-3 rounded-xs bg-indigo-100 dark:bg-indigo-950/60" />
            <div className="w-3 h-3 rounded-xs bg-indigo-300 dark:bg-indigo-800/80" />
            <div className="w-3 h-3 rounded-xs bg-indigo-500 dark:bg-indigo-600" />
            <div className="w-3 h-3 rounded-xs bg-indigo-700 dark:bg-indigo-500" />
            <span>High</span>
          </div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5">
          {dailyStats.map((d) => {
            const parts = d.date.split('-');
            const shortDate = `${parts[1]}/${parts[2]}`;
            const colorClass = getHeatmapColor(d.revenue);

            return (
              <div
                key={d.date}
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative p-1.5 rounded-md border text-center transition-all cursor-pointer ${colorClass}`}
              >
                <div className="text-[10px] font-mono leading-none mb-1 opacity-80">
                  {shortDate}
                </div>
                <div className="text-[10px] font-mono tabular-nums leading-none font-bold">
                  ${Math.round(d.revenue)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected / Hovered Day details bar */}
        {hoveredDay && (
          <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex flex-wrap items-center justify-between gap-3 font-mono border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {hoveredDay.date}
              </span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {formatCurrency(hoveredDay.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>{hoveredDay.units} items sold</span>
              <span>·</span>
              <span>{hoveredDay.orderCount} distinct orders</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
