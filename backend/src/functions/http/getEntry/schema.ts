export default {
  type: "object",
  properties: {
    headline: {
      type: "string",
      pattern: "^(?!s*$).+",
    },
    description: {
      type: "string",
      pattern: "^(?!s*$).+",
    },
    entryDate: { type: "string" },
    mood: { type: "integer", minimum: 0, maximum: 5 },
  },
  required: ["headline", "entryDate"],
} as const;
