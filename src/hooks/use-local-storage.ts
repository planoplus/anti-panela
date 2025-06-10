
"use client";

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Initialize state with initialValue. This ensures server and client initial render match.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Effect to load the actual value from localStorage after the component has mounted on the client.
  useEffect(() => {
    // This check ensures localStorage is accessed only on the client side.
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          // Parse stored json or if none, return initialValue
          setStoredValue(JSON.parse(item) as T);
        }
        // If item is null, storedValue correctly remains initialValue (which was set in useState).
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}" in useEffect:`, error);
        // Fallback to initialValue if there's an error reading/parsing.
        setStoredValue(initialValue);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if the key changes. initialValue is for initialization.

  const setValue: SetValue<T> = useCallback(
    value => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a client`
        );
        return; // Do not update state or localStorage on server
      }
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // We dispatch a custom event so other hooks listening on the same key can update
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue] // storedValue is needed for the functional update `value(storedValue)`
  );

  // Effect for listening to storage events from other tabs/windows
  // and custom "local-storage" event for same-tab updates.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === window.localStorage) {
        try {
          if (e.newValue !== null) {
            setStoredValue(JSON.parse(e.newValue) as T);
          } else {
            // Item was removed from localStorage in another tab
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.warn(`Error processing storage event for key "${key}":`, error);
          setStoredValue(initialValue); // Fallback
        }
      }
    };
    
    // Handles the custom "local-storage" event dispatched by setValue
    const handleCustomEvent = () => {
      if (typeof window !== 'undefined') { // Ensure this runs client-side
        try {
          const item = window.localStorage.getItem(key);
          if (item !== null) {
            setStoredValue(JSON.parse(item) as T);
          } else {
            // If item is removed or becomes null
            setStoredValue(initialValue);
          }
        } catch (error) {
          console.warn(`Error processing 'local-storage' custom event for key "${key}":`, error);
          setStoredValue(initialValue); // Fallback
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleCustomEvent);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]); // initialValue is used as a fallback

  return [storedValue, setValue];
}
