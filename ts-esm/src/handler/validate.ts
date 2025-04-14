import { validate } from 'class-validator';
import { MyAwesome } from '../lib/index.js'; // Uncomment this, and you will see the bundle size increase
// import { MyAwesome } from '@pouja/lib/MyAwesome';

export async function validateApi() {
    const myAwesome = new MyAwesome();
    // @ts-expect-error
    myAwesome.awesome = 3;
    
    validate(myAwesome).then(errors => {
        // errors is an array of validation errors
        if (errors.length > 0) {
          console.error('validation failed. errors: ', errors);
        } else {
          console.log('validation succeed');
        }
      });
}
