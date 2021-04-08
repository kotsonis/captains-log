export default {
    type: "object",
    properties: {
      name: { type: 'string' },
      description: {type: 'string'},
      entryDate: {type: 'string'},
      mood: {type: 'number'}
    },
    required: [
      'name', 
      'description',
      'entryDate'
    ]
  } as const;
  