const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

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
      // Basic throttling could be added here in API Gateway, but for Function URLs 
      // we just reject unauthorized
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // Fetch today's orders using the GSI (DateIndex)
    // We just query the current date's orders, and maybe yesterday's if needed.
    // For simplicity, we'll query today's date string.
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const data = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'DateIndex',
      KeyConditionExpression: '#d = :dateVal',
      ExpressionAttributeNames: { '#d': 'date' },
      ExpressionAttributeValues: { ':dateVal': dateStr },
      ScanIndexForward: false // Newest first
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: data.Items || [] })
    };
  } catch (err) {
    console.error('Error fetching orders:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
