import { toast } from 'react-hot-toast';

class ToastManager {
  constructor(maxToasts = 2) {
    this.maxToasts = maxToasts; 
    this.activeToasts = []; 
  }

  showSuccessToast(message) {
    const toastId = toast.success(message);
    
    this.activeToasts.push(toastId);
    
    if (this.activeToasts.length > this.maxToasts) {
      const oldestToastId = this.activeToasts.shift(); 
      toast.dismiss(oldestToastId);
    }
    
    return toastId;
  }

  showErrorToast(message) {
    const toastId = toast.error(message);
    this.activeToasts.push(toastId);
    
    if (this.activeToasts.length > this.maxToasts) {
      const oldestToastId = this.activeToasts.shift();
      toast.dismiss(oldestToastId);
    }
    
    return toastId;
  }

  clearAllToasts() {
    toast.dismiss(); 
    this.activeToasts = [];
  }
}

export const toastManager = new ToastManager(2)