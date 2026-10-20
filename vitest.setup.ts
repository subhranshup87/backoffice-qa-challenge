import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library registers this itself when Vitest runs with `globals: true`,
// which this project does not. Without it, a second `render` in a file leaves
// the first tree mounted and every query after the first test matches twice.
afterEach(cleanup);
