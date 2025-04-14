import { IsBoolean, IsEmail, IsPhoneNumber, IsString } from "class-validator";

export class CustomerContact {
    @IsPhoneNumber()
    public phoneNumber!: string;

    @IsEmail()
    public emailAddress!: string;

    @IsBoolean()
    public hasPigeonLocation!: boolean;
}