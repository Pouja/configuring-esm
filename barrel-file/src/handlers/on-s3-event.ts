import { DynamoDBManager, LambdaManager } from '../lib/index.js';

export function handler() {
    const dynamodb = new DynamoDBManager();
    const lambdaManager = new LambdaManager();

    console.log(dynamodb, lambdaManager);
    return {
        status: 200
    }
}