import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

console.log('importing from use-dynamodb');

export const awesome = 'awesome'; // this will only get treeshaking when you minify your bundle

export class DynamoDBManager {
  private client = new DynamoDBClient({});

  async createItem(table: string, attributes: Record<string, any>) {
    const id = uuidv4();

    await this.client.send(new PutItemCommand({
      TableName: table,
      Item: {
        id: { S: id },
        ...Object.entries(attributes).reduce((acc, [key, val]) => {
          acc[key] = { S: String(val) };
          return acc;
        }, {} as Record<string, { S: string }>)
      }
    }));
  }

  private banner() {
    return 'banner';
  }
}