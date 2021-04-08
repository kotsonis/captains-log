/**
 * Creates the serverless functions entry for this function
 * Implements:
 * - iamRoles per lambda function
 */
import { handlerPath } from '@libs/handlerResolver';
export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "delete",
        path: "entries/{entryId}",
        cors: true,
        authorizer: "auth0Authorizer",
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: [
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem"
      ],
      Resource: [
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.ENTRIES_TABLE}",
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.ENTRIES_TABLE}/index/${self:provider.environment.ENTRY_ID_INDEX}"
      ],
      
    },
    {
      Effect: 'Allow',
      Action: [
        's3:putObject',
        's3:getObject',
        's3:DeleteObject'
      ],
      Resource: ["arn:aws:s3:::${self:provider.environment.ENTRIES_S3_BUCKET}/*"]
    },
  ],
};