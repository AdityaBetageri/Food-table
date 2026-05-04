import { useEffect, useRef } from 'react';
import { useSocketContext } from '../context/SocketContext';

/**
 * Hook to subscribe to socket events
 * @param {string} event - Socket event name
 * @param {Function} callback - Event handler
 */
export function useSocket(event, callback) {
  const { subscribe } = useSocketContext();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!event) return;
    const unsubscribe = subscribe(event, (...args) => callbackRef.current(...args));
    return unsubscribe;
  }, [event, subscribe]);
}

/**
 * Hook to emit socket events
 * @returns {Function} emit function
 */
export function useSocketEmit() {
  const { emit } = useSocketContext();
  return emit;
}