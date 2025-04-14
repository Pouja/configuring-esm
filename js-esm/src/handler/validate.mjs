import { validate } from 'class-validator';
import { MyAwesome } from '#pouja/lib/MyAwesome.mjs';

export async function validateApi() {
    const myAwesome = new MyAwesome();
    // @ts-expect-error
    myAwesome.awesome = 3;
    
    validate(myAwesome).then(errors => {
        // errors is an array of validation errors
        if (errors.length > 0) {
          console.log('validation failed. errors: ', errors);
        } else {
          console.log('validation succeed');
        }
      });
}
