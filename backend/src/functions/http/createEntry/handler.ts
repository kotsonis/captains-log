import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import * as uuid from 'uuid'
import { getUserId } from '@libs/getUserId';
import type { FromSchema } from "json-schema-to-ts";
import {createItem} from '@libs/database'

const logger = createLogger('createEntry')

import { createEntryRequest } from '@interfaces/createEntryRequest'
import schema from './schema';

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

const createEntry: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  logger.info('Processing event: ', event)
  const id = uuid.v4()
  const creationTime = new Date().toISOString()
  const user = getUserId(event)
  logger.info(`for user ${user}`)
  const parsedBody:createEntryRequest = <createEntryRequest> event.body

  const newItem = {
    userId: user,
    entryId: id,
    timestamp: creationTime,
    mood: 2,
    ...parsedBody
  }
  logger.info('Ready to add item: ', newItem)
  
  await createItem(newItem);
  
  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
}

export const main = middyfy(createEntry);

