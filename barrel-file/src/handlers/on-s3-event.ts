import { DynamoDBManager, LambdaManager } from '../lib/index.js';

export function handler() {
    const dynamodb = new DynamoDBManager();

    // this death code will only be treeshaking when you minify
    if (false) {
        const lambdaManager = new LambdaManager();
        console.log(lambdaManager);
    }

    console.log(dynamodb);
    return {
        status: 200
    }
}