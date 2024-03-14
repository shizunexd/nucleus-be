import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Supplier } from './Supplier';
import enumKeys from '../utils/enumKeys';
import ProductType from './ProductType';
import { MinLength, IsInt, IsPositive, IsDateString, IsIn, IsString } from 'class-validator';

export enum ProductSortOptions {
    name = 'name',
    release_date = 'release_date',
    price = 'price',
    type = 'type'
}

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsString()
    @MinLength(1)
    name: string;

    @Column()
    @IsString()
    @MinLength(1)
    description: string;

    @ManyToOne(() => Supplier)
    @JoinColumn({ name: 'supplier_id', referencedColumnName: 'id' })
    @IsInt()
    supplier_id: number;

    @Column({ type: 'integer' })
    @IsDateString()
    release_date: Date;

    @Column({ type: 'decimal', precision: 6, scale: 2 })
    @IsPositive()
    price: number;

    @Column({ type: 'text', name: 'product_type' })
    @IsIn(enumKeys(ProductType))
    type: ProductType;

    @Column({ type: 'integer', default: false, select: false })
    is_deleted: boolean;

    @Column({ default: () => 'CURRENT_TIMESTAMP', select: false })
    created: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', select: false })
    updated: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    last_updated_by: string;
}
