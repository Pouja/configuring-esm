import { IsDefined, IsString } from "class-validator";
import { User } from "./User";

console.log('MyAwesome.ts');

export class MyAwesome {
    @IsString()
    public awesome!: string;

    @IsDefined()
    public user!: User;
}