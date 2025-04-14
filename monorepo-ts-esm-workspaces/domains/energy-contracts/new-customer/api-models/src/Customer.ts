import { IsString, IsEnum, ValidateNested } from 'class-validator';
import { EnergyType } from '@packages/base-models/enums/EnergyType.js';
import type { Address } from '@packages/base-models/models/Address.js';

export class Customer {
    @IsString()
    public id!: string;

    @IsEnum(EnergyType)
    public energyType!: EnergyType;

    @ValidateNested()
    public address!: Address
}