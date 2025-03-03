import toast from "react-hot-toast";

let activeToastsCount = 0;
const MAX_TOASTS = 3;

export const showLimitedToast = (message, status) => {
  if (activeToastsCount < MAX_TOASTS) {
    activeToastsCount++;

    if (status === 'success') {
      const toastId = toast.success(message, {
        onClose: () => {
          activeToastsCount--;
        }
      });

      return toastId;
    } else {
      const toastId = toast.error(message, {
        onClose: () => {
          activeToastsCount--;
        }
      })

      return toastId;
    }
  }

  return null;
}