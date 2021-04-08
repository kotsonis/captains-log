import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { getUserId } from '@libs/getUserId';
import { getItem, updateItemUrl } from '@libs/database';
import { getUploadUrl } from '@libs/storage';
import type { FromSchema } from "json-schema-to-ts";

const logger = createLogger('getSignedUrl');

// parse the event.body according to schema
import schema from './schema';
type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> };
type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>;

/**
 * lambda function to generate a signedUrl from s3 for client to upload image
 * @param event - which should contain the filename under body.file and entryId in the query
 * @returns a JSON with the signedUrl to which client can upload the image
 */
const getSignedUrl: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const user = getUserId(event);
  const entryId = event.pathParameters.entryId;
  logger.info(`Request to generate upload URL for user ${user} / todo item ${entryId}`);

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
  // update entry in database with attachment location
  const fname = event.body.file;
  const bucketKey = `${entryId}/${fname}`;
  const revisedEntryItem = updateItemUrl(journalEntry.Items[0].timestamp, user,bucketKey);
  logger.info(`Revised TODO item`, revisedEntryItem);
  // get an UploadURL for the client to store the image
  const uploadUrl = getUploadUrl(bucketKey);
  logger.info(`generated upload URL ${uploadUrl}`);

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  };
};
// wrap this handler around the middy middleware
export const main = middyfy(getSignedUrl);

