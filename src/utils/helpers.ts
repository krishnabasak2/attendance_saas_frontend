/** Format ISO date string to locale readable format */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/** Today's date as YYYY-MM-DD for date inputs */
export const todayISO = () => new Date().toISOString().split('T')[0];

/** Extract axios error message */
export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response: { data: { message: string } } }).response;
    return r?.data?.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
};
