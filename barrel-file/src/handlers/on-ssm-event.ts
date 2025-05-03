import { SSMManager } from '../lib';

export async function handler(event: any) {
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