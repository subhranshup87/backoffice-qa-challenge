/**
 * The application's data layer: a single in-memory store, seeded from a fixed
 * dataset. There is no database and no seed step — installing dependencies and
 * starting the dev server is the whole setup.
 *
 * The seed is derived entirely from record indices and fixed tables, so every
 * boot produces byte-identical data with no randomness and no dependence on the
 * current date. State lives for as long as the server process does.
 */

import { TIER_LIMITS, TIERS, type Limits, type Tier } from "@/lib/limits";

export type KycStatus = "verified" | "pending" | "rejected";

export type TransactionType = "deposit" | "withdrawal";

export type Transaction = {
  id: string;
  customerId: string;
  type: TransactionType;
  amountCents: number;
  reference: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  kycStatus: KycStatus;
  tier: Tier;
  limits: Limits;
  registeredAt: string;
};

export type PayoutStatus = "pending" | "approved" | "rejected";

export type Payout = {
  id: string;
  customerId: string;
  amountCents: number;
  method: "sepa" | "paypal";
  status: PayoutStatus;
  requestedAt: string;
  decidedAt: string | null;
};

type Store = {
  customers: Customer[];
  transactions: Transaction[];
  payouts: Payout[];
};

/**
 * Sixty fixed customers. Held as an explicit list rather than generated from
 * name fragments, so that the roster is varied, readable and stable — a
 * reproduction step that names a customer keeps naming the same one.
 */
const CUSTOMER_NAMES = [
  "Amara Okafor",
  "Bjarne Lindqvist",
  "Chiara Rossi",
  "Dmitri Volkov",
  "Elif Yilmaz",
  "Farid Haddad",
  "Gabriela Santos",
  "Hiroshi Tanaka",
  "Ingrid Halvorsen",
  "Jamal Bakr",
  "Katarzyna Nowak",
  "Liam Doherty",
  "Mei Chen",
  "Nikolaj Sorensen",
  "Olamide Adeyemi",
  "Priya Raghunathan",
  "Quentin Moreau",
  "Rania Khalil",
  "Sanjay Iyer",
  "Tomas Novak",
  "Ulrike Brandt",
  "Valentina Ferrari",
  "Wiktor Kaminski",
  "Xiulan Zhou",
  "Yara Nasser",
  "Zoltan Kovacs",
  "Aditi Sharma",
  "Bruno Carvalho",
  "Camille Dubois",
  "Diego Herrera",
  "Eero Virtanen",
  "Fatima Diallo",
  "Georgi Petrov",
  "Hana Dvorak",
  "Idris Bello",
  "Julia Wagner",
  "Kwame Mensah",
  "Lucia Marino",
  "Mateo Alvarez",
  "Nadia Petrescu",
  "Oskar Lehmann",
  "Paulina Zielinska",
  "Rafael Duarte",
  "Selma Halilovic",
  "Theo Andersson",
  "Umut Demir",
  "Vera Ivanova",
  "Wanjiru Kariuki",
  "Yusuf Rahman",
  "Zeynep Aydin",
  "Anders Bergstrom",
  "Beatriz Lopes",
  "Cormac Byrne",
  "Daniela Muresan",
  "Emeka Nwosu",
  "Freya Johansson",
  "Gustavo Pinto",
  "Helena Vasquez",
  "Ismail Toure",
  "Jasmin Keller",
];

const KYC_CYCLE: KycStatus[] = [
  "verified",
  "verified",
  "verified",
  "pending",
  "rejected",
];

/**
 * Transaction amounts in cents. Sub-hundred-euro and four-figure amounts
 * alternate so that every customer's history contains both.
 */
const TRANSACTION_AMOUNTS = [9_000, 120_000, 4_550, 780_050, 1_999, 250_000, 34_999, 100_000];

const TRANSACTION_REFERENCES = [
  "Card top-up",
  "Bank transfer",
  "Instant transfer",
  "SEPA transfer",
  "PayPal",
  "Sofort",
];

const PAYOUT_AMOUNTS = [45_000, 128_050, 9_900, 512_000, 76_500];

/** All seeded timestamps are offsets from this fixed instant. */
const EPOCH = Date.UTC(2024, 5, 1, 8, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

function isoDaysAfterEpoch(days: number, minutes = 0): string {
  return new Date(EPOCH + days * DAY + minutes * 60_000).toISOString();
}

/** Day, counted from the epoch, on which customer `index` registered. */
function registrationDay(index: number): number {
  return index * 3;
}

function seedLimits(tier: Tier, index: number): Limits {
  const caps = TIER_LIMITS[tier];
  const dailyDepositCents = caps.dailyDepositCents - (index % 5) * (caps.dailyDepositCents / 50);
  return {
    dailyDepositCents,
    dailyWithdrawalCents: dailyDepositCents / 2,
  };
}

function seedCustomers(): Customer[] {
  return CUSTOMER_NAMES.map((name, index) => {
    const tier = TIERS[index % TIERS.length];

    return {
      id: `cus_${String(index + 1).padStart(3, "0")}`,
      name,
      email: `${name.replace(" ", ".").toLowerCase()}@example.com`,
      kycStatus: KYC_CYCLE[index % KYC_CYCLE.length],
      tier,
      limits: seedLimits(tier, index),
      registeredAt: isoDaysAfterEpoch(registrationDay(index)),
    };
  });
}

function seedTransactions(customers: Customer[]): Transaction[] {
  return customers.flatMap((customer, index) => {
    const count = 6 + (index % 4);

    return Array.from({ length: count }, (_, position) => {
      const step = index + position;
      return {
        id: `txn_${customer.id.slice(4)}_${position + 1}`,
        customerId: customer.id,
        type: step % 3 === 0 ? ("withdrawal" as const) : ("deposit" as const),
        amountCents: TRANSACTION_AMOUNTS[step % TRANSACTION_AMOUNTS.length],
        reference: TRANSACTION_REFERENCES[step % TRANSACTION_REFERENCES.length],
        // Activity starts a few days after the account is opened, so no
        // transaction can predate the customer it belongs to.
        createdAt: isoDaysAfterEpoch(
          registrationDay(index) + 4 + position * 6 + (index % 7),
          position * 37,
        ),
      };
    });
  });
}

function seedPayouts(customers: Customer[]): Payout[] {
  return customers
    .map((customer, index) => ({ customer, index }))
    .filter(({ index }) => index % 4 === 0)
    .map(({ customer, index }, position) => {
      const status: PayoutStatus =
        position === 3 ? "approved" : position === 7 ? "rejected" : "pending";
      // Requested well after the account was opened, and after the customer's
      // transaction history has had time to accumulate.
      const requestedDay = registrationDay(index) + 90 + position;

      return {
        id: `pay_${String(position + 1).padStart(3, "0")}`,
        customerId: customer.id,
        amountCents: PAYOUT_AMOUNTS[position % PAYOUT_AMOUNTS.length],
        method: position % 3 === 0 ? ("paypal" as const) : ("sepa" as const),
        status,
        requestedAt: isoDaysAfterEpoch(requestedDay, position * 53),
        decidedAt: status === "pending" ? null : isoDaysAfterEpoch(requestedDay + 1),
      };
    });
}

function seed(): Store {
  const customers = seedCustomers();
  return {
    customers,
    transactions: seedTransactions(customers),
    payouts: seedPayouts(customers),
  };
}

/**
 * Held on `globalThis` so that the dev server's module reloading does not hand
 * out a fresh store on every recompile.
 */
const globalForStore = globalThis as typeof globalThis & {
  backofficeStore?: Store;
};

function store(): Store {
  globalForStore.backofficeStore ??= seed();
  return globalForStore.backofficeStore;
}

export function listCustomers(): Customer[] {
  return [...store().customers];
}

export function getCustomer(id: string): Customer | undefined {
  return store().customers.find((customer) => customer.id === id);
}

export function listTransactions(customerId: string): Transaction[] {
  return store().transactions.filter((transaction) => transaction.customerId === customerId);
}

export function listPayouts(): Payout[] {
  return [...store().payouts];
}

export function getPayout(id: string): Payout | undefined {
  return store().payouts.find((payout) => payout.id === id);
}

export function updateCustomerLimits(id: string, limits: Limits): Customer | undefined {
  const customer = getCustomer(id);
  if (!customer) return undefined;

  customer.limits = limits;
  return customer;
}

/**
 * Books the withdrawal that an approved payout pays out. Ids follow the seed's
 * convention, numbered after the customer's existing history.
 */
function bookPayout(payout: Payout): void {
  const position = listTransactions(payout.customerId).length + 1;

  store().transactions.push({
    id: `txn_${payout.customerId.slice(4)}_${position}`,
    customerId: payout.customerId,
    type: "withdrawal",
    amountCents: payout.amountCents,
    reference: `Payout ${payout.id}`,
    createdAt: new Date().toISOString(),
  });
}

export function approvePayout(id: string): Payout | undefined {
  const payout = getPayout(id);
  if (!payout) return undefined;

  payout.status = "approved";
  payout.decidedAt = new Date().toISOString();
  bookPayout(payout);

  return payout;
}

export function rejectPayout(id: string): Payout | undefined {
  const payout = getPayout(id);
  if (!payout) return undefined;

  payout.status = "rejected";
  payout.decidedAt = new Date().toISOString();

  return payout;
}
