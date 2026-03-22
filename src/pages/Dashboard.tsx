import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGroceries } from '../context/GroceryContext';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { Plus, ScanLine, AlertTriangle, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { items, loading } = useGroceries();

  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const thisMonthItems = items.filter(item => {
      if (!item.dateAdded) return false;
      const date = item.dateAdded.toDate ? item.dateAdded.toDate() : new Date(item.dateAdded);
      return isWithinInterval(date, { start, end });
    });

    const totalSpent = thisMonthItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return { totalSpent, recentItems: thisMonthItems.slice(0, 5) };
  }, [items]);

  if (loading) return <div className="p-4">Loading...</div>;

  const budget = profile?.monthlyBudget || 0;
  const remaining = budget - currentMonthStats.totalSpent;
  const percentageUsed = budget > 0 ? (currentMonthStats.totalSpent / budget) * 100 : 0;
  const isNearLimit = percentageUsed > 80;
  const isOverLimit = percentageUsed >= 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/scanner" className="p-2 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
            <ScanLine className="w-5 h-5" />
          </Link>
          <Link to="/groceries" className="p-2 bg-emerald-600 text-white rounded-full">
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Budget Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium">Monthly Budget</h3>
          {isOverLimit ? (
            <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3 mr-1" /> Over Budget
            </span>
          ) : isNearLimit ? (
            <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3 mr-1" /> Near Limit
            </span>
          ) : (
            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> On Track
            </span>
          )}
        </div>
        
        <div className="flex items-end space-x-2 mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">₱{currentMonthStats.totalSpent.toFixed(2)}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ ₱{budget.toFixed(2)}</span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mt-4">
          <div 
            className={`h-2.5 rounded-full ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
          ₱{Math.max(remaining, 0).toFixed(2)} remaining
        </p>
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Purchases</h3>
          <Link to="/groceries" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">View All</Link>
        </div>
        
        <div className="space-y-3">
          {currentMonthStats.recentItems.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No purchases this month yet.</p>
              <Link to="/scanner" className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2 inline-block">Scan an item</Link>
            </div>
          ) : (
            currentMonthStats.recentItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                    {item.category === 'Produce' ? '🍎' : item.category === 'Dairy' ? '🥛' : item.category === 'Meat' ? '🥩' : item.category === 'Snacks' ? '🥨' : '🛒'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity}x • {item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">₱{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.dateAdded?.toDate ? item.dateAdded.toDate().toLocaleDateString() : new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
