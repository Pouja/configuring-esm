import { DynamoDBManager, LambdaManager } from '../lib/index.js';

export function handler() {
    const dynamodb = new DynamoDBManager();

    if (false) {
        const lambdaManager = new LambdaManager();
        console.log(lambdaManager);
    }

    console.log(dynamodb);
    return {
        status: 200
    }
}