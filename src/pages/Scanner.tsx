import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useGroceries } from '../context/GroceryContext';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { CheckCircle2, XCircle, Loader2, Camera } from 'lucide-react';

export const Scanner: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const mountedRef = useRef(true);
  const { addItem } = useGroceries();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    quantity: 1,
    category: 'Pantry'
  });

  useEffect(() => {
    mountedRef.current = true;
    
    // Catch unhandled promise rejections from video.play() inside html5-qrcode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'VIDEO') {
            const video = node as HTMLVideoElement;
            const originalPlay = video.play;
            video.play = () => {
              try {
                const promise = originalPlay.apply(video);
                if (promise !== undefined && typeof promise.catch === 'function') {
                  return promise.catch((err) => {
                    if (err && err.name !== 'AbortError') {
                      console.error('Video play error:', err);
                    }
                  });
                }
                return promise;
              } catch (err) {
                return Promise.resolve();
              }
            };
          }
        });
      });
    });

    const reader = document.getElementById('reader');
    if (reader) {
      observer.observe(reader, { childList: true, subtree: true });
    }

    return () => {
      mountedRef.current = false;
      observer.disconnect();
      if (scannerRef.current) {
        if (isStoppingRef.current) return;
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          } else if (document.getElementById('reader')) {
            const clearResult = scannerRef.current.clear() as any;
            if (clearResult instanceof Promise) {
              clearResult.catch(() => {});
            }
          }
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startScanner = async () => {
    if (isStarting || isScanning || isStoppingRef.current) return;
    
    setError(null);
    setIsStarting(true);
    isProcessingRef.current = false;
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;
            await stopScanner();
            if (mountedRef.current) {
              await handleScan(decodedText);
            }
          } catch (err) {
            console.error("Error in scan callback:", err);
            isProcessingRef.current = false;
          }
        },
        (errorMessage) => {
          // ignore continuous scanning errors
        }
      );
      if (mountedRef.current) {
        setIsScanning(true);
      } else {
        // If unmounted while starting, stop it immediately
        await stopScanner();
      }
    } catch (err) {
      console.error("Camera start error:", err);
      if (mountedRef.current) {
        setError("Failed to start camera. Please ensure you have granted camera permissions in your browser.");
      }
    } finally {
      if (mountedRef.current) {
        setIsStarting(false);
      }
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current || isStoppingRef.current) return;
    
    isStoppingRef.current = true;
    
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      if (mountedRef.current) console.error("Failed to stop scanner", err);
    }

    try {
      if (scannerRef.current && !scannerRef.current.isScanning && document.getElementById('reader')) {
        const clearResult = scannerRef.current.clear() as any;
        if (clearResult instanceof Promise) {
          await clearResult;
        }
      }
    } catch (err) {
      if (mountedRef.current) console.error("Failed to clear scanner", err);
    }

    isStoppingRef.current = false;
    if (mountedRef.current) {
      setIsScanning(false);
    }
  };

  const handleScan = async (code: string) => {
    setScannedCode(code);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await response.json();
      
      if (!mountedRef.current) return;

      if (data.status === 1 && data.product) {
        setProductDetails(data.product);
        setFormData({
          name: data.product.product_name || 'Unknown Product',
          price: 0,
          quantity: 1,
          category: 'Pantry'
        });
      } else {
        setError("Product not found in database. Please enter details manually.");
        setFormData({ name: '', price: 0, quantity: 1, category: 'Other' });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError("Failed to fetch product details.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        isProcessingRef.current = false;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addItem({
        name: formData.name,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        category: formData.category,
        barcode: scannedCode || undefined,
        dateAdded: Timestamp.now(),
      });
      navigate('/groceries');
    } catch (err) {
      console.error("Failed to add item:", err);
      if (mountedRef.current) {
        setError("Failed to add item. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scan Barcode</h2>
      
      <div className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${scannedCode ? 'hidden' : 'block'}`}>
        <div className="relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 min-h-[250px]">
          <div id="reader" className="w-full min-h-[250px]"></div>
          {(!isScanning || isStarting) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isScanning && !isStarting && <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600" />}
              {isStarting && <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />}
            </div>
          )}
        </div>
        
        {!isScanning ? (
          <div className="mt-6 flex flex-col items-center justify-center space-y-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Point your camera at a product barcode
            </p>
            <button
              onClick={startScanner}
              disabled={isStarting}
              className="flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={stopScanner}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Stop Camera
            </button>
          </div>
        )}

        {error && !scannedCode && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-4 text-center">{error}</p>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-500 dark:text-gray-400">Looking up product...</p>
        </div>
      )}

      {scannedCode && !loading && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            {productDetails ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <XCircle className="w-6 h-6 text-amber-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {productDetails ? 'Product Found!' : 'Manual Entry Required'}
            </h3>
          </div>

          {error && <p className="text-sm text-amber-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Organic Milk"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₱)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value ? parseFloat(e.target.value) : 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value ? parseInt(e.target.value) : 1})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {['Produce', 'Dairy', 'Meat', 'Snacks', 'Beverages', 'Pantry', 'Household', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setScannedCode(null);
                  setProductDetails(null);
                  setError(null);
                }}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Scan Again
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
