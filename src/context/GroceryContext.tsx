import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';

export interface GroceryItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  barcode?: string;
  dateAdded: any; // Firestore timestamp
  createdAt: any; // Firestore timestamp
}

interface GroceryContextType {
  items: GroceryItem[];
  loading: boolean;
  addItem: (item: Omit<GroceryItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, item: Partial<GroceryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const GroceryContext = createContext<GroceryContextType>({
  items: [],
  loading: true,
  addItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
});

export const useGroceries = () => useContext(GroceryContext);

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'groceries'),
      orderBy('dateAdded', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GroceryItem[];
      setItems(newItems);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/groceries`);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = async (item: Omit<GroceryItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newItem = {
      ...item,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'users', user.uid, 'groceries'), newItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/groceries`);
    }
  };

  const updateItem = async (id: string, item: Partial<GroceryItem>) => {
    if (!user) return;
    const itemRef = doc(db, 'users', user.uid, 'groceries', id);
    try {
      await updateDoc(itemRef, item);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/groceries/${id}`);
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    const itemRef = doc(db, 'users', user.uid, 'groceries', id);
    try {
      await deleteDoc(itemRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/groceries/${id}`);
    }
  };

  return (
    <GroceryContext.Provider value={{ items, loading, addItem, updateItem, deleteItem }}>
      {children}
    </GroceryContext.Provider>
  );
};
