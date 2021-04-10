export default {
    type: "object",
    properties: {
      headline: { type: 'string' },
      description: {type: 'string'},
      entryDate: {type: 'string'},
      mood: {type: 'number'}
    },
    required: [
      'headline', 
      'description',
      'entryDate'
    ]
  } as const;
  