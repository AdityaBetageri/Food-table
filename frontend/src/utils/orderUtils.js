/**
 * Groups identical items in an order for display purposes.
 * Items are considered identical if they have the same name, price, and 'isAddition' status.
 * This helps consolidate multiple additions of the same item into a single line with a quantity multiplier.
 */
export const groupOrderItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  const grouped = {};
  items.forEach(item => {
    // We group by name, price, and isAddition to ensure that "NEW" items 
    // are still visually distinct from previously served/acknowledged ones.
    // If they have the same status, they get combined.
    const status = item.status || 'unknown';
    const key = `${item.name}-${item.price}-${!!item.isAddition}-${status}`;
    if (!grouped[key]) {
      grouped[key] = { ...item };
    } else {
      grouped[key].qty += item.qty;
    }
  });
  
  return Object.values(grouped);
};
