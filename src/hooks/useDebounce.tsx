import { useState, useEffect, useRef } from "react";

function useDebounce(callback: () => void, delay: number) {
  const latestCallback = useRef();

  useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  return useRef((...args) => {
    if (latestCallback.current) {
      clearTimeout(latestCallback.current.timeout);
      latestCallback.current.timeout = setTimeout(() => {
        callback(...args);
      }, delay);
    }
  }).current;
}

export default useDebounce;
