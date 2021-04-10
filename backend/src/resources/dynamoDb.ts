/** 
 * AWS DynamoDB table declaration for storing todo Items
 */
const EntriesTable = {
      Type: "AWS::DynamoDB::Table",
      Properties: {
        TableName: "${self:provider.environment.ENTRIES_TABLE}",
        AttributeDefinitions: [
          {
            AttributeName: "userId",
            AttributeType: "S",
          },
          {
            AttributeName: "timestamp",
            AttributeType: "S",
          },
          {
            AttributeName: "entryId",
            AttributeType: "S",
          },
          {
            AttributeName: "entryDate",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "userId",
            KeyType: "HASH",
          },
          {
            AttributeName: "timestamp",
            KeyType: "RANGE",
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
        LocalSecondaryIndexes: [
          {
            IndexName: "${self:provider.environment.ENTRY_ID_INDEX}",
            KeySchema: [
              {
                AttributeName: "userId",
                KeyType: "HASH"
              },
              {
                AttributeName: "entryId",
                KeyType: "RANGE"
              }
            ],
            Projection: {
              ProjectionType: "ALL",
            }
          },
          {
            IndexName: "${self:provider.environment.ENTRY_DATE_INDEX}",
            KeySchema: [
              {
                AttributeName: "userId",
                KeyType: "HASH"
              },
              {
                AttributeName: "entryDate",
                KeyType: "RANGE"
              }
            ],
            Projection: {
              ProjectionType: "ALL",
            }
          }
        ]
      },
};
export {EntriesTable}