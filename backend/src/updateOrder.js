const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;
const API_KEY = process.env.DISPATCH_API_KEY;

exports.handler = async (event) => {
  try {
    if (event.requestContext.http.method === 'OPTIONS') {
      return { statusCode: 200, body: 'OK' };
    }

    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (token !== API_KEY) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { orderId, status } = body;

    if (!orderId || !status) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId or status' }) };
    }

    const validStatuses = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid status' }) };
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: orderId },
      UpdateExpression: 'SET #st = :s',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: { ':s': status }
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, orderId, status })
    };
  } catch (err) {
    console.error('Error updating order:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
