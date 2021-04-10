import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import { getUserId } from '@libs/getUserId';
import {getItem} from '@libs/database'

const logger = createLogger('getEntry')



const getEntry: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const user = getUserId(event)
  const entryId = event.pathParameters.entryId;
  logger.info(`for user ${user}, entry ${entryId}`)
  const todoQuery = await getItem(entryId, user);
  if (todoQuery.Count === 0) {
    logger.info(`Got invalid entryId ${entryId} for user ${user}`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Journal entry does not exist",
      }),
    };
  }
  const journalEntry = todoQuery.Items[0]
  return {
    statusCode: 201,
    body: JSON.stringify({
      item: journalEntry
    })
  }
}

export const main = middyfy(getEntry);

