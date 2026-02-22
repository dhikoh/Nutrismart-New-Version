import { IsString, IsNumber, IsDate, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum LivestockSpecies {
    BOVINE = 'BOVINE', // Sapi
    OVINE = 'OVINE',   // Domba
    CAPRINE = 'CAPRINE', // Kambing
    POULTRY = 'POULTRY', // Unggas (Ayam/Bebek)
    PORCINE = 'PORCINE', // Babi
    EQUINE = 'EQUINE', // Kuda
    AQUACULTURE = 'AQUACULTURE' // Ikan
}

export class CreateLivestockDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(LivestockSpecies)
    @IsNotEmpty()
    species: LivestockSpecies;

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

    @IsOptional()
    @IsString()
    enclosureId?: string;
}
