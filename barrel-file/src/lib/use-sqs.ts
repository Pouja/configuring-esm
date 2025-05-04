import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { formatISO } from "date-fns";

console.log('importing from use-sqs');

export class SQSManager {
  private client = new SQSClient({});

  async sendMessage(queueUrl: string, message: string) {
    const timestamp = formatISO(new Date());

    await this.client.send(new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: `${timestamp} - ${message}`
    }));
  }
}