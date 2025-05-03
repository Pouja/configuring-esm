import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import os from "os";

export class CloudWatchManager {
  private client = new CloudWatchClient({});

  async sendMetric(namespace: string, metricName: string, value: number) {
    const hostname = os.hostname();

    await this.client.send(new PutMetricDataCommand({
      Namespace: namespace,
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Dimensions: [{ Name: "Host", Value: hostname }]
      }]
    }));
  }
}