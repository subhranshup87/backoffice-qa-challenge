import { test, expect } from '@playwright/test';

const testData = {
  payoutId: 'pay_005',
  customerId: 'cus_017',
};

test('Verify /api/payouts/{id}/approve rejects approval of an already approved payout', async ({ request }) => {
  const { payoutId, customerId } = testData;
  await request.post(`/api/payouts/${payoutId}/approve`);
  const secondResponse = await request.post(`/api/payouts/${payoutId}/approve`);
  const response = await request.get(`/api/customers/${customerId}`);
  const { transactions } = await response.json();
  const matchingTransactions = transactions.filter(
    (transaction: { reference: string }) => transaction.reference === `Payout ${payoutId}`
  );
  expect(secondResponse.status()).toBe(409);
  expect(matchingTransactions).toHaveLength(1);
});

