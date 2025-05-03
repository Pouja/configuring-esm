// load-dotenv contains a side effect, if setting `"sideEffects": false` in the package.json, this will be removed from the bundle
import './load-dotenv';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export class SSMManager {
  private client = new SSMClient({});

  async getConfig(paramName: string, fallbackEnvVar: string): Promise<string> {
    try {
      const response = await this.client.send(new GetParameterCommand({
        Name: paramName,
        WithDecryption: true
      }));
      return response.Parameter?.Value ?? "";
    } catch {
      return process.env[fallbackEnvVar] ?? "";
    }
  }
}