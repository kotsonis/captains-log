
import * as AWS  from 'aws-sdk'
import {JournalEntry} from '@interfaces/JournalEntry'
import { createLogger } from '@libs/logger'
const logger = createLogger('database')
import { captureAWS } from "aws-xray-sdk-core";

var XAWS = captureAWS(AWS);
const docClient = new XAWS.DynamoDB.DocumentClient()

const entriesTable = process.env.ENTRIES_TABLE
const entryIndex = process.env.ENTRY_ID_INDEX
const bucketName = process.env.ENTRIES_S3_BUCKET

export async function createItem(newItem: AWS.DynamoDB.DocumentClient.PutItemInput) {
  const result = await docClient.put({
    TableName: entriesTable,
    Item: newItem
  }).promise()
  return result
}

export async function getItems(userId: string) {
  logger.info(`searching in table ${entriesTable}`)
  const result = await docClient.query({
    TableName: entriesTable,
    KeyConditionExpression: 'userId = :user',
    ExpressionAttributeValues: {
      ':user': userId
    },
  }).promise()
  return result.Items
}

/** Queries the database to find the todo item of the user
 * 
 * @param {string} entryItem - the ID of the todo task
 * @param {string} user - The ID of the user
 * @returns - a DynamoDB QueryOutput promise
 */
export async function getItem(entryItem: string, user: string) {
    const result = await docClient
      .query({
        TableName: entriesTable,
        IndexName: entryIndex,
        KeyConditionExpression: "userId = :user and entryId = :id",
        ExpressionAttributeValues: {
          ":user": user,
          ":id": entryItem
        }
      })
      .promise()
  
    logger.info('Got entry: ', result)
    return result
  }

/**
 * updates a todo entry with a new URL
 * @param sortKey - the timestamp
 * @param user - the primary key
 * @param bucketKey - name of the file in S3
 */
export async function updateItemUrl(sortKey: string, user: string, bucketKey: string) {
  const url = `https://${bucketName}.s3.amazonaws.com/${bucketKey}`
  
  var dbParams = {
    TableName: entriesTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    UpdateExpression: "set attachmentUrl = :u",
    ExpressionAttributeValues:{
      ":u":url
    },
    ReturnValues:"UPDATED_NEW"
  }
  logger.info('Getting ready to update database with these params')
  logger.info(dbParams)
  const result = await docClient.update(dbParams)
    .promise()
  return result
}

/**
 * Updates the database entry with new mood category
 * @param {string} sortKey  the timestamp
 * @param {string} user  the userId
 * @param {number} newStatus the updated mood of the entry
 * @returns 
 */
export async function updateItemStatus(sortKey: string, user: string, newStatus: number) {
  var dbParams = {
    TableName: entriesTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    UpdateExpression: "set mood = :newMood",
    ExpressionAttributeValues:{
      ":newMood":newStatus
    },
    ReturnValues:"UPDATED_NEW"
  }
  logger.info('Getting ready to update database with these params')
  logger.info(dbParams)
  const result = await docClient.update(dbParams)
    .promise()
  return result
}
export async function updateItem(sortKey: string, user: string, newEntry: JournalEntry) {
  const dbUpdateExpression = "SET timestamp =: entryDate"
  const dbExpressionAttributeValues = {
    ":entryDate": newEntry.entryDate
  }
  if(newEntry.hasOwnProperty('description')){
    dbUpdateExpression.concat(', description = :desc')
    dbExpressionAttributeValues[":desc"] = newEntry.description
  }
  if(newEntry.hasOwnProperty('headline')) {
    dbUpdateExpression.concat(', name = :headline')
    dbExpressionAttributeValues[":headline"] = newEntry.headline
  }
  if(newEntry.hasOwnProperty('mood')) {
    dbUpdateExpression.concat(', mood = :m')
    dbExpressionAttributeValues[":m"] = newEntry.mood
  }
  
  var dbParams = {
    TableName: entriesTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    UpdateExpression: dbUpdateExpression,
    ExpressionAttributeValues:dbExpressionAttributeValues,
    ReturnValues:"UPDATED_NEW"
  }
  logger.info('Getting ready to update database with these params')
  logger.info(dbParams)
  const result = await docClient.update(dbParams)
    .promise()
  return result
}
/**
 * delete a todo item from the database
 * @param sortKey - the timestamp
 * @param user - the primary key
 */
export async function deleteItem(sortKey: string, user: string) {
  var dbParams = {
    TableName: entriesTable,
    Key: {
      userId: user,
      timestamp: sortKey
    },
    ReturnValues: 'ALL_OLD'
  }
  logger.info('Getting ready to delete database entry with these params')
  logger.info(dbParams)
  const result = await docClient.delete(dbParams)
    .promise()
    .then((data) => {
      logger.info('Deleted entry with following return',data)
    })
    .catch((err) => {
      logger.info('Delete failed with following error',err)
    })
  return result
}