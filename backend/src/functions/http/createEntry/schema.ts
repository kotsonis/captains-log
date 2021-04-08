export default {
  type: "object",
  properties: {
    name: {
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
  required: ["name", "entryDate", "description"],
} as const;
