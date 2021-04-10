import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"

import { getUserId } from '@libs/getUserId';
import type { FromSchema } from "json-schema-to-ts";
import { getItem, updateItem } from '@libs/database';
import {JournalEntry} from '@interfaces/JournalEntry'
const logger = createLogger('updateEntry')

// parse the event.body according to schema
import schema from './schema';
type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

/**
 * lambda function to update todo status
 * @param event which should contain the new done status in body.done and itemId in path
 * @returns an empty 200 answer
 */
const updateEntry: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const user = getUserId(event);
  const entryId = event.pathParameters.entryId;
  logger.info(`Request to update todo item ${entryId} for user ${user}`);

  // check if todo item exists
  const journalEntry = await getItem(entryId, user);
  if (journalEntry.Count === 0) {
    logger.info(`Got invalid entryId ${entryId} for user ${user}`);
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Journal entry does not exist'
      })
    }
  }
  const newEntry = event.body as JournalEntry
  // update entry in database with attachment location
  const revisedEntryItem = updateItem(journalEntry.Items[0].timestamp, user,newEntry);
  logger.info(`Revised Journal entry`, revisedEntryItem);
  // get an UploadURL for the client to store the image

  return {
    statusCode: 201,
    body:''
  };
};
export const main = middyfy(updateEntry);

