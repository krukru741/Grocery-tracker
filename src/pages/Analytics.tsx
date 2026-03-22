import React, { useMemo } from 'react';
import { useGroceries } from '../context/GroceryContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from 'date-fns';

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#047857', '#065F46', '#064E3B'];

export const Analytics: React.FC = () => {
  const { items, loading } = useGroceries();

  const { categoryData, monthlyData, highestCategory } = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const thisMonthItems = items.filter(item => {
      if (!item.dateAdded) return false;
      const date = item.dateAdded.toDate ? item.dateAdded.toDate() : new Date(item.dateAdded);
      return isWithinInterval(date, { start, end });
    });

    // Category Data
    const categoryTotals: Record<string, number> = {};
    thisMonthItems.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (item.price * item.quantity);
    });

    const categoryData = Object.keys(categoryTotals).map(key => ({
      name: key,
      value: categoryTotals[key]
    })).sort((a, b) => b.value - a.value);

    const highestCategory = categoryData.length > 0 ? categoryData[0] : null;

    // Monthly Data (Last 6 months)
    const monthlyTotals: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthName = format(monthStart, 'MMM');
      
      const monthItems = items.filter(item => {
        if (!item.dateAdded) return false;
        const date = item.dateAdded.toDate ? item.dateAdded.toDate() : new Date(item.dateAdded);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      monthlyTotals[monthName] = monthItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }

    const monthlyData = Object.keys(monthlyTotals).map(key => ({
      name: key,
      total: monthlyTotals[key]
    }));

    return { categoryData, monthlyData, highestCategory };
  }, [items]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>

      {/* Insights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Top Category</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {highestCategory ? highestCategory.name : 'N/A'}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {highestCategory ? `₱${highestCategory.value.toFixed(2)}` : '₱0.00'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Items</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {items.length}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All time</p>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category (This Month)</h3>
        {categoryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">6-Month Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `₱${value}`} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(value: number) => `₱${value.toFixed(2)}`} />
              <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
