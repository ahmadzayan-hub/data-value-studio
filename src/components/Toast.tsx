import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-navy text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
      <CheckCircle className="text-gold" size={20} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
