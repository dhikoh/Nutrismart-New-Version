import { IsString, IsNumber, IsDate, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLivestockDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    species: string;

    @IsString()
    @IsNotEmpty()
    breed: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dob: Date;

    @IsNumber()
    @IsNotEmpty()
    currentWeight: number;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsOptional()
    @IsBoolean()
    isForSale?: boolean;

    @IsOptional()
    @IsNumber()
    salePrice?: number;

    @IsOptional()
    @IsString()
    publicNotes?: string;
}
