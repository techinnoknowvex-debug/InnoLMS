import { toast } from 'react-toastify';

export const notifySuccess = (message) =>
  toast.success(message || 'Success', { position: 'top-right' });

export const notifyError = (message) =>
  toast.error(message || 'Something went wrong', { position: 'top-right' });


