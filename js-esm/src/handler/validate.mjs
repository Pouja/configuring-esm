import { validate } from 'class-validator';
import { MyAwesome } from '#lib/MyAwesome.mjs';

export async function validateApi() {
    const myAwesome = new MyAwesome();
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
