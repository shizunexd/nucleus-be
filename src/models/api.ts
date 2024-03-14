import { IsInt, IsIn, IsArray, IsEnum, Max, Min } from 'class-validator';
import enumKeys from '../utils/enumKeys';
import ProductType from '../entities/ProductType';
import { ProductSortOptions } from '../entities/Product';

export enum SortDirection {
    asc = 'asc',
    desc = 'desc'
}
export class Query {
    @IsArray()
    supplier?: Array<number>;

    @IsEnum(ProductType, { each: true })
    type?: [];

    @IsInt()
    @Min(0)
    priceMin?: number;

    @IsInt()
    @Min(0)
    priceMax?: number;

    @IsInt()
    @Min(0)
    page?: number;

    @IsIn(enumKeys(SortDirection))
    sort?: string;

    @IsIn(enumKeys(ProductSortOptions))
    sortby?: string;

    @IsIn(enumKeys(SortDirection))
    direction?: SortDirection;

    @IsInt()
    @Min(10)
    @Max(100)
    itemsPerPage?: number;
}

export class ProductBodyRequest {
    name: string;
    description: string;
    supplier_id: number;
    release_date: Date;
    type: ProductType;
    price: number;
}

export class SupplierBodyRequest {
    name: string;
    description: string;
    address: string;
    phone: string;
    logo_url: string;
}
