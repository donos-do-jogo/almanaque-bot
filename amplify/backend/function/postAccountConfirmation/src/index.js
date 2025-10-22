/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_CHATDB_ARN
    STORAGE_CHATDB_NAME
    STORAGE_CHATDB_STREAMARN
Amplify Params - DO NOT EDIT */

// post-confirmation-trigger.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.STORAGE_CHATDB_NAME;

exports.handler = async (event) => {
    console.log('Cognito event received:', JSON.stringify(event, null, 2));

    // We only run our logic for the "PostConfirmation_ConfirmSignUp" trigger
    if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
        const userId = event.request.userAttributes.sub;
        const userEmail = event.request.userAttributes.email;

        // The base user record to be created in DynamoDB
        const userItem = {
            PK: `USER#${userId}`,
            SK: `USER#${userId}`,
            type: 'User',
            id: userId,
            email: userEmail,
            createdAt: new Date().toISOString(),
        };

        console.log(`Attempting to create user record for user: ${userId}`);

        try {
            await docClient.send(new PutCommand({
                TableName: tableName,
                Item: userItem,
                // This prevents overwriting if a user record somehow already exists
                ConditionExpression: 'attribute_not_exists(PK)',
            }));
            console.log(`SUCCESS: User record created for ${userId}`);
        } catch (error) {
            console.error(`ERROR: Could not create user record for ${userId}.`, error);
        }
    }

    return event;
};
