import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(timerRef.current);
    setToast({ visible: true, msg });
    timerRef.current = setTimeout(() => setToast({ visible: false, msg: '' }), 3200);
  }, []);

  return { toast, showToast };
}
