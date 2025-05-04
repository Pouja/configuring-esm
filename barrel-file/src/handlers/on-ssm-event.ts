import { SSMManager } from '../lib/use-ssm.js';

export async function handler(event: any) {
    // esbuild will bundle all files that are reachable from one folder up
    // const manager = await import('../' + event.superUnsafeThis); 

    // esbuild will bundle both files
    // const manager = await import(event.isS3Event ? '../lib/use-s3.js' : '../lib/use-sqs.js'); 

    // esbuild will bundle all files under the lib folder, not just the s3 and sqs one
    const manager = await import('../lib/' + (event.isS3Event ? 'use-s3.js' : 'use-sqs.js'));
  
    console.info(manager);

    const ssmManager = new SSMManager();
    const featureEnabled = await ssmManager.getConfig('feature-a', 'false');
    if (featureEnabled === 'false') {
        return {
            body: {
                customerId: event.id,
            },
            status: 200
        }
    } else {
        return {
            body: {
                userId: event.id,
            },
            status: 200
        }
    }
}