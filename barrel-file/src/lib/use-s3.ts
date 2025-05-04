// All these imports will be added in the bundle even when the on-s3event handler is not using is.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { lookup as getMimeType } from "mime-types";

console.log('importing from use-s3');

// All this dead code will be added when using a barrel file or not setting 'sideEffects: false' in your package.json
// Imagine that most files in a corporate software program are around 500~750 lines.
export class S3Manager {
  public client = new S3Client({});

  async uploadFile(bucket: string, key: string, body: Buffer) {
    const contentType = getMimeType(key) || "application/octet-stream";

    await this.client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    }));
  }

  public generateFakeLogs() {
    const logs = [];
    for (let i = 0; i < 1000; i++) {
      logs.push({
        timestamp: Date.now(),
        message: `Fake log entry ${i}`,
        level: ["debug", "info", "warn", "error"][i % 4]
      });
    }
    return logs;
  }

  public unusedAnalytics() {
    const events = Array.from({ length: 500 }).map((_, idx) => ({
      type: "click",
      id: `button-${idx}`,
      ts: new Date().toISOString()
    }));
    return events;
  }

  public simulateEncryptionLayer(data: string) {
    const key = "secret-key-that-does-nothing";
    return Buffer.from(data + key).toString("base64");
  }

  public recursiveFizzBuzz(n: number): string[] {
    if (n === 0) return [];
    const result = this.recursiveFizzBuzz(n - 1);
    if (n % 15 === 0) result.push("FizzBuzz");
    else if (n % 3 === 0) result.push("Fizz");
    else if (n % 5 === 0) result.push("Buzz");
    else result.push(n.toString());
    return result;
  }

  public heavyComputation() {
    const matrix = Array.from({ length: 100 }, () =>
      Array.from({ length: 100 }, () => Math.random())
    );
    return matrix.map(row => row.reduce((a, b) => a + b, 0));
  }

  public legacyBackupCode() {
    const paths = ["/tmp/backup1", "/tmp/backup2"];
    return paths.map(p => `Backed up to ${p}`);
  }

  public simulateUnusedStateMachine() {
    const states = ["idle", "running", "paused", "completed"];
    const transitions = states.flatMap(from =>
      states.map(to => ({ from, to }))
    );
    return transitions;
  }

  public logBanner() {
    console.log(`
███████╗███████╗██╗     ███████╗███████╗███████╗
██╔════╝██╔════╝██║     ██╔════╝██╔════╝██╔════╝
█████╗  █████╗  ██║     █████╗  █████╗  ███████╗
██╔══╝  ██╔══╝  ██║     ██╔══╝  ██╔══╝  ╚════██║
███████╗███████╗███████╗███████╗███████╗███████║
╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝
    `);
  }
}
