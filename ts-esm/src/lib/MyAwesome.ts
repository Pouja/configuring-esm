import { IsString } from "class-validator";

console.log('Awesome');

export class MyAwesome {
    @IsString()
    public awesome!: string;
}