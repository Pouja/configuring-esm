import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { z } from "zod";

const payloadSchema = z.object({
  message: z.string()
});

export class LambdaManager {
  private client = new LambdaClient({});

  async invokeFunction(name: string, payload: unknown) {
    const validated = payloadSchema.parse(payload);

    await this.client.send(new InvokeCommand({
      FunctionName: name,
      Payload: Buffer.from(JSON.stringify(validated))
    }));
  }
}