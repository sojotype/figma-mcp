import type { z } from "zod";
import type { DECLARATIVE_SCHEMAS } from "./declarative";
import type { UTILITARIAN_SCHEMAS } from "./utilitarian";

export type ToolsParams = {
  [K in
    | keyof typeof UTILITARIAN_SCHEMAS
    | keyof typeof DECLARATIVE_SCHEMAS]: z.infer<
    | (K extends keyof typeof UTILITARIAN_SCHEMAS
        ? (typeof UTILITARIAN_SCHEMAS)[K]
        : never)
    | (K extends keyof typeof DECLARATIVE_SCHEMAS
        ? (typeof DECLARATIVE_SCHEMAS)[K]
        : never)
  >;
};
