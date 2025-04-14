import { IsNumber } from 'class-validator';

console.log('User');

export class User {
    @IsNumber()
    public id!: number;
}