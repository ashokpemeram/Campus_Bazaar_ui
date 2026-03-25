export const formatCurrency = (amount) => {
    const value = Number(amount);
    if (!Number.isFinite(value)) return '₹0';
    return `₹${value.toLocaleString('en-IN')}`;
};
