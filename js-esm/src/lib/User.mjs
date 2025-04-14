import { isNumber } from 'class-validator';

console.log('User');

export class User {
    
    id

    constructor(id) {
        if (isNumber(id)) {
            this.id = id;
        }
    }
}