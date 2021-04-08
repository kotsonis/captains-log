
import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"
import { getUserId } from '@libs/getUserId';
import { getItem , deleteItem} from '@libs/database'
import {deleteBucket} from '@libs/storage'

const logger = createLogger('deleteEntries');

const deleteEntries: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all Journal entries for a current user
  const user = getUserId(event);
  const entryId = event.pathParameters.entryId;
  logger.info(
    `Request to delete entry ${entryId} for user ${user} `
  );
  // check if todo item exists
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
  // check if an S3 bucket was created for this item and delete if so
  if (journalEntry.hasOwnProperty('attachmentUrl')) {
    logger.info('will be deleting S3 bucket')
    try {
        deleteBucket(journalEntry.attachmentUrl)
    } catch (e) {
        logger.info('Delete s3: Got error',e)
    }
  }
  logger.info('database entry to delete', journalEntry)
  // delete the todo entry
  const timestamp = journalEntry.timestamp

  try {
      deleteItem(timestamp, user)
  } catch (e) {
      logger.info('Got error',e)
  }
  
  return {
      statusCode: 200,
      body: ''
  }
}

export const main = middyfy(deleteEntries);

