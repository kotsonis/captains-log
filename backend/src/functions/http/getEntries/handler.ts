import 'source-map-support/register';
import { middyfy } from '@libs/lambda';
import { createLogger } from '@libs/logger'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from "aws-lambda"

import { getUserId } from '@libs/getUserId';
import {getItems} from '@libs/database'

const logger = createLogger('getEntries')

/**
 * lambda function to retrieve user todo items from db
 * @param event 
 * @returns a JSON with all the items retrieved from db
 */
const getEntries: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all Journal entries for a current user
    const userId = await getUserId(event);
    logger.info(`Retrieving Journal entries for user ${userId}`);
    const entries = await getItems(userId);
    return {
        statusCode: 201,
        body: JSON.stringify({
            items: entries
        })
    };
}

// wrap this handler around the middy middleware
export const main = middyfy(getEntries);