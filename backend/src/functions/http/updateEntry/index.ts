/**
 * Creates the serverless functions entry for this function
 * Implements:
 * - request checking versus schema from APIGateway
 * - iamRoles per lambda function
 */

import { handlerPath } from '@libs/handlerResolver';
import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "patch",
        path: "entries/{entryId}",
        cors: true,
        authorizer: "auth0Authorizer",
        request: {
          schema: {
            "application/json": schema,
          },
        },
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: [
        "dynamodb:UpdateItem",
        "dynamodb:Query",
      ],
      Resource: [
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.ENTRIES_TABLE}",
        "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.ENTRIES_TABLE}/index/${self:provider.environment.ENTRY_ID_INDEX}"
      ],
      
    },
  ],
};