import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    type: string; // SALE, PURCHASE

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    status?: string; // PENDING, COMPLETED, CANCELLED

    @IsString()
    @IsOptional()
    notes?: string;
}
