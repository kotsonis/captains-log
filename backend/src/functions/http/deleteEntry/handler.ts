
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
  const timestamp = journalEntry.timestamp

  logger.info('Deleting entry and associated resources', journalEntry)

  const deletePromises = []

  // delete the todo entry
  deletePromises.push(deleteItem(timestamp, user))

  // check if an S3 bucket was created for this item and delete if so
  if (journalEntry.hasOwnProperty('attachmentUrl')) {
    logger.info('will be deleting S3 bucket')
    deletePromises.push(deleteBucket(journalEntry.attachmentUrl))
  }

  try {
      await Promise.all(deletePromises)
  } catch (e) {
      logger.info('Got error during deletion', e)
  }
  
  return {
      statusCode: 200,
      body: ''
  }
}

export const main = middyfy(deleteEntries);

