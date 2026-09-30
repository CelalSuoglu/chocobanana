/** Same short number shown on the owner dashboard order list. */
export function displayOrderNumber(orderId: string) {
  return `#${orderId.slice(-8)}`;
}
