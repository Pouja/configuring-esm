import { IsNumber } from 'class-validator';

console.log('User.ts');

export class User {
    @IsNumber()
    public id!: number;
}