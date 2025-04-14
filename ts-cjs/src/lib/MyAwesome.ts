import { IsString } from "class-validator";

console.log('MyAwesome.ts');

export class MyAwesome {
    @IsString()
    public awesome!: string;
}