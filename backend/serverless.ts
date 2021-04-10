import type { AWS } from '@serverless/typescript';

import getEntries from '@functions/http/getEntries';
import createEntry from '@functions/http/createEntry';
import getSignedUrl from '@functions/http/getSignedUrl'
import auth0Authorizer from '@functions/auth/auth0Authorizer'
import {BucketPolicy, AttachmentsBucket} from '@resources/s3'
import {EntriesTable} from '@resources/dynamoDb'
import deleteEntry from '@functions/http/deleteEntry'
import updateEntry from '@functions/http/updateEntry'

const serverlessConfiguration: AWS = {
  service: 'captains-log',
  variablesResolutionMode: "20210326",
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
    appSecrets: "${ssm:/aws/reference/secretsmanager/captains/app}",  
  },
  plugins: [
    'serverless-webpack',
    'serverless-iam-roles-per-function'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: 'eu-central-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    tracing: {
      lambda: true,
      apiGateway: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      ENTRIES_TABLE: "${self:custom.appSecrets.tableName}${self:provider.stage}", 
      ENTRY_ID_INDEX: "${self:custom.appSecrets.entryIndex}${self:provider.stage}",
      ENTRY_DATE_INDEX: "${self:custom.appSecrets.tableName}bydate${self:provider.stage}",
      ENTRIES_S3_BUCKET: "${self:custom.appSecrets.s3Endpoint}${self:provider.stage}",
      JWKS: "${self:custom.appSecrets.jwksUrl}"

    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { 
    getEntries,
    auth0Authorizer,
    createEntry,
    getSignedUrl,
    deleteEntry,
    updateEntry },
  resources: {
    Resources: {
      EntriesTable,
    
    AttachmentsBucket,
    BucketPolicy 
  },
}
};

module.exports = serverlessConfiguration;
