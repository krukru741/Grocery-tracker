import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../firebase';
import { LogOut, Save, User, Database } from 'lucide-react';
import { useGroceries } from '../context/GroceryContext';
import { Timestamp } from 'firebase/firestore';

const phSampleData = [
  // Produce
  { name: 'Mango (1kg)', price: 150, quantity: 1, category: 'Produce' },
  { name: 'Saba Banana (1kg)', price: 60, quantity: 1, category: 'Produce' },
  { name: 'Calamansi (1/2 kg)', price: 40, quantity: 1, category: 'Produce' },
  { name: 'Garlic / Bawang (1/4 kg)', price: 35, quantity: 1, category: 'Produce' },
  { name: 'Red Onion / Sibuyas (1kg)', price: 120, quantity: 1, category: 'Produce' },
  { name: 'Tomato / Kamatis (1kg)', price: 80, quantity: 1, category: 'Produce' },
  { name: 'Eggplant / Talong (1kg)', price: 70, quantity: 1, category: 'Produce' },
  { name: 'Pechay (1 bundle)', price: 25, quantity: 1, category: 'Produce' },
  { name: 'Ampalaya (1kg)', price: 90, quantity: 1, category: 'Produce' },
  { name: 'Potato / Patatas (1kg)', price: 100, quantity: 1, category: 'Produce' },

  // Dairy
  { name: 'Magnolia Fresh Milk (1L)', price: 95, quantity: 1, category: 'Dairy' },
  { name: 'Eden Cheese (165g)', price: 55, quantity: 1, category: 'Dairy' },
  { name: 'Nestle All Purpose Cream (250ml)', price: 65, quantity: 1, category: 'Dairy' },
  { name: 'Yakult (5 bottles)', price: 50, quantity: 1, category: 'Dairy' },
  { name: 'Bear Brand Powdered Milk (320g)', price: 115, quantity: 1, category: 'Dairy' },
  { name: 'Selecta Ice Cream (1.5L)', price: 250, quantity: 1, category: 'Dairy' },
  { name: 'Anchor Butter (200g)', price: 130, quantity: 1, category: 'Dairy' },
  { name: 'Alaska Evaporada (370ml)', price: 30, quantity: 1, category: 'Dairy' },
  { name: 'Alaska Condensada (300ml)', price: 40, quantity: 1, category: 'Dairy' },
  { name: 'Nestle Yogurt (100g)', price: 35, quantity: 1, category: 'Dairy' },

  // Meat
  { name: 'Pork Belly / Liempo (1kg)', price: 320, quantity: 1, category: 'Meat' },
  { name: 'Whole Chicken (1kg)', price: 200, quantity: 1, category: 'Meat' },
  { name: 'Beef Sirloin (1kg)', price: 450, quantity: 1, category: 'Meat' },
  { name: 'Ground Pork / Giniling (1kg)', price: 280, quantity: 1, category: 'Meat' },
  { name: 'Bangus / Milkfish (1kg)', price: 180, quantity: 1, category: 'Meat' },
  { name: 'Tilapia (1kg)', price: 130, quantity: 1, category: 'Meat' },
  { name: 'Purefoods Tender Juicy Hotdog (1kg)', price: 190, quantity: 1, category: 'Meat' },
  { name: 'Pampangas Best Tocino (480g)', price: 150, quantity: 1, category: 'Meat' },
  { name: 'CDO Skinless Longganisa (250g)', price: 75, quantity: 1, category: 'Meat' },
  { name: 'Chicken Breast Fillet (1kg)', price: 250, quantity: 1, category: 'Meat' },

  // Snacks
  { name: 'SkyFlakes Crackers (10 packs)', price: 60, quantity: 1, category: 'Snacks' },
  { name: 'Piattos Cheese (85g)', price: 35, quantity: 1, category: 'Snacks' },
  { name: 'Nova Multigrain Snacks (78g)', price: 35, quantity: 1, category: 'Snacks' },
  { name: 'Boy Bawang Cornick (100g)', price: 20, quantity: 1, category: 'Snacks' },
  { name: 'Oishi Prawn Crackers (60g)', price: 15, quantity: 1, category: 'Snacks' },
  { name: 'Stick-O Chocolate (380g)', price: 70, quantity: 1, category: 'Snacks' },
  { name: 'Fudgee Barr Chocolate (10s)', price: 65, quantity: 1, category: 'Snacks' },
  { name: 'Choco Mucho (1 pc)', price: 10, quantity: 5, category: 'Snacks' },
  { name: 'Nagaraya Cracker Nuts (160g)', price: 45, quantity: 1, category: 'Snacks' },
  { name: 'Chippy BBQ (110g)', price: 30, quantity: 1, category: 'Snacks' },

  // Beverages
  { name: 'Coca-Cola (1.5L)', price: 75, quantity: 1, category: 'Beverages' },
  { name: 'Sprite (1.5L)', price: 75, quantity: 1, category: 'Beverages' },
  { name: 'Royal Tru Orange (1.5L)', price: 75, quantity: 1, category: 'Beverages' },
  { name: 'San Miguel Pale Pilsen (320ml)', price: 45, quantity: 6, category: 'Beverages' },
  { name: 'Kopiko Brown Coffee (10 sachets)', price: 70, quantity: 1, category: 'Beverages' },
  { name: 'Milo Chocolate Powder (300g)', price: 95, quantity: 1, category: 'Beverages' },
  { name: 'Nestea Iced Tea Lemon (250g)', price: 85, quantity: 1, category: 'Beverages' },
  { name: 'C2 Green Tea Apple (1L)', price: 40, quantity: 1, category: 'Beverages' },
  { name: 'Tang Orange Juice (25g)', price: 18, quantity: 5, category: 'Beverages' },
  { name: 'Nature\'s Spring Water (1L)', price: 25, quantity: 2, category: 'Beverages' },

  // Pantry
  { name: 'Datu Puti Vinegar (1L)', price: 45, quantity: 1, category: 'Pantry' },
  { name: 'Silver Swan Soy Sauce (1L)', price: 50, quantity: 1, category: 'Pantry' },
  { name: 'Mang Tomas Sarsa (330g)', price: 40, quantity: 1, category: 'Pantry' },
  { name: 'UFC Banana Ketchup (320g)', price: 35, quantity: 1, category: 'Pantry' },
  { name: 'Magic Sarap (14 sachets)', price: 55, quantity: 1, category: 'Pantry' },
  { name: 'Knorr Sinigang Mix (40g)', price: 25, quantity: 2, category: 'Pantry' },
  { name: 'Jasmine Rice (5kg)', price: 280, quantity: 1, category: 'Pantry' },
  { name: 'Century Tuna Flakes in Oil (180g)', price: 40, quantity: 3, category: 'Pantry' },
  { name: 'Purefoods Corned Beef (150g)', price: 85, quantity: 2, category: 'Pantry' },
  { name: '555 Sardines (155g)', price: 20, quantity: 4, category: 'Pantry' },

  // Household
  { name: 'Surf Powder Detergent (1kg)', price: 110, quantity: 1, category: 'Household' },
  { name: 'Joy Dishwashing Liquid (250ml)', price: 50, quantity: 1, category: 'Household' },
  { name: 'Downy Fabric Conditioner (1L)', price: 150, quantity: 1, category: 'Household' },
  { name: 'Safeguard Soap (130g)', price: 45, quantity: 3, category: 'Household' },
  { name: 'Sunsilk Shampoo (180ml)', price: 95, quantity: 1, category: 'Household' },
  { name: 'Creamsilk Conditioner (180ml)', price: 100, quantity: 1, category: 'Household' },
  { name: 'Colgate Toothpaste (150g)', price: 85, quantity: 1, category: 'Household' },
  { name: 'Baygon Insecticide (500ml)', price: 280, quantity: 1, category: 'Household' },
  { name: 'Zonrox Bleach (1L)', price: 60, quantity: 1, category: 'Household' },
  { name: 'Sanicare Bathroom Tissue (4 rolls)', price: 80, quantity: 1, category: 'Household' },

  // Other
  { name: 'Charcoal / Uling (1 pack)', price: 20, quantity: 1, category: 'Other' },
  { name: 'Guitar Matchbox / Posporo (10s)', price: 15, quantity: 1, category: 'Other' },
  { name: 'Maxx Menthol Candy (50s)', price: 35, quantity: 1, category: 'Other' },
  { name: 'Vicks Vaporub (10g)', price: 40, quantity: 1, category: 'Other' },
  { name: 'White Flower Oil (2.5ml)', price: 50, quantity: 1, category: 'Other' },
  { name: 'Band-Aid Plastic Strips (12s)', price: 25, quantity: 1, category: 'Other' },
  { name: 'Cleene Cotton Buds (200 tips)', price: 30, quantity: 1, category: 'Other' },
  { name: 'Green Cross Rubbing Alcohol (500ml)', price: 85, quantity: 1, category: 'Other' },
  { name: 'Surgical Face Masks (50 pcs)', price: 50, quantity: 1, category: 'Other' },
  { name: 'Efficascent Oil (50ml)', price: 45, quantity: 1, category: 'Other' }
];

export const Settings: React.FC = () => {
  const { profile, updateBudget } = useAuth();
  const { addItem } = useGroceries();
  const [budget, setBudget] = useState(profile?.monthlyBudget || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [seedMessage, setSeedMessage] = useState('');

  const handleSaveBudget = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await updateBudget(Number(budget));
      setMessage('Budget updated successfully!');
    } catch (error) {
      setMessage('Failed to update budget.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedMessage('Adding 80 items... Please wait.');
    try {
      // Add items sequentially to avoid rate limits/overwhelming the connection
      for (const item of phSampleData) {
        await addItem({
          ...item,
          dateAdded: Timestamp.now(),
        });
      }
      setSeedMessage('Successfully added 80 Philippine grocery items!');
    } catch (error) {
      console.error("Failed to seed data:", error);
      setSeedMessage('Failed to add some items. Check console.');
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-6">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-emerald-100 dark:border-emerald-900" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile?.displayName || 'User'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Budget Planning</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Budget (₱)</label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSaveBudget}
                  disabled={isSaving}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              {message && (
                <p className={`mt-2 text-sm ${message.includes('success') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sample Data Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Sample Data</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Populate your grocery list with 80 common Philippine grocery items (10 per category) to test the app.
        </p>
        <button
          onClick={handleSeedData}
          disabled={isSeeding}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
        >
          <Database className="w-5 h-5 mr-2" />
          {isSeeding ? 'Adding Items...' : 'Add Philippine Groceries'}
        </button>
        {seedMessage && (
          <p className={`mt-3 text-sm text-center ${seedMessage.includes('Failed') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {seedMessage}
          </p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">Account Actions</h4>
        <button
          onClick={async () => {
            try {
              await logout();
            } catch (err) {
              console.error("Failed to logout:", err);
            }
          }}
          className="w-full flex items-center justify-center px-4 py-3 border border-red-200 dark:border-red-800 rounded-xl shadow-sm text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
