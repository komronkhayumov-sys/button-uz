export function formatUzbekCurrency(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0 so'm";
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}
