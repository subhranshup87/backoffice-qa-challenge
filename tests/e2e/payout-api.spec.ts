import { test, expect } from '@playwright/test';

const testData = {
  payoutId: 'pay_005',
  customerId: 'cus_017',
  unverifiedKycPayoutId: 'pay_002',
  unverifiedKycCustomerId: 'cus_005',
};

test('Verify /api/payouts/{id}/approve rejects approval of an already approved payout', async ({ request }) => {
  await request.post(`/api/payouts/${testData.payoutId}/approve`);
  const secondResponse = await request.post(`/api/payouts/${testData.payoutId}/approve`);
  const response = await request.get(`/api/customers/${testData.customerId}`);
  const { transactions } = await response.json();
  const matchingTransactions = transactions.filter(
    (transaction: { reference: string }) => 
      transaction.reference === `Payout ${testData.payoutId}`
  );
  expect(secondResponse.status()).toBe(409);
  expect(matchingTransactions).toHaveLength(1);
});

test('Verify /api/payouts/{id}/approve rejects approval when KYC is not verified', async ({ request }) => {
  const response = await request.post(`/api/payouts/${testData.unverifiedKycPayoutId}/approve`);
  const customerResponse = await request.get(
    `/api/customers/${testData.unverifiedKycCustomerId}`,
  );
  const { transactions } = await customerResponse.json();
  const matchingTransactions = transactions.filter(
    (transaction: { reference: string }) =>
      transaction.reference === `Payout ${testData.unverifiedKycPayoutId}`,
  );
  expect(response.status()).toBe(403);
  expect(matchingTransactions).toHaveLength(0);
});
