import { IsNumber, IsOptional, IsString } from "class-validator";

export class Address {
    @IsString()
    public street!: string;

    @IsOptional()
    @IsNumber()
    public houseNumber?: number;
}