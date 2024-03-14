import {
    controller,
    httpGet,
    httpPost,
    httpPatch,
    httpDelete,
    BaseHttpController,
    queryParam,
    requestBody,
    requestParam
} from 'inversify-express-utils';
import { Between, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import loadDefaultData from '../scripts/load_default';
import ClientError from '../errors/client-error';
import { Product, ProductSortOptions } from '../entities/Product';
import { defaultAuthHandler, RoutePermissions } from '../middlewares/default-auth';
import { validateOrReject } from 'class-validator';
import { ProductBodyRequest, SupplierBodyRequest, Query } from '../models/api';
import { Supplier } from '../entities/Supplier';
import { SortDirection } from '../models/api';
import enumKeys from '../utils/enumKeys';

// Max price ceiling since Infinity doesnt exist on typescript
const infinity = 9999999;

const defaultItemsPerPage = 10;
const maxItemsPerPage = 100;

@controller('/api')
export class InventoryController extends BaseHttpController {
    @httpPost('/reload-database')
    async reloadData() {
        await loadDefaultData();
        return { status: 'OK' };
    }

    @httpGet('/inventory', defaultAuthHandler([RoutePermissions.view]))
    async getInventory(@queryParam() query: Query) {
        let queryValidator = new Query();
        queryValidator = Object.assign(queryValidator, query);
        queryValidator.page = query.page && Number(query.page);
        queryValidator.priceMin = query.priceMin && Number(query.priceMin);
        queryValidator.priceMax = query.priceMax && Number(query.priceMax);
        queryValidator.itemsPerPage = query.itemsPerPage && Number(query.itemsPerPage);
        if (query.supplier) {
            if (Array.isArray(query.supplier)) {
                queryValidator.supplier = query.supplier;
            } else {
                queryValidator.supplier = [query.supplier];
            }
        }

        try {
            await validateOrReject(queryValidator, { skipMissingProperties: true });
        } catch (error) {
            throw new ClientError(error);
        }
        let itemsPerPage = query.itemsPerPage || defaultItemsPerPage;
        const offset = (query.page || 0) * itemsPerPage;
        const min = query.priceMin || 0;
        const max = query.priceMax || infinity;
        let whereParams: any = {
            is_deleted: false,
            price: Between(min, max)
        };
        let orderParams: any = {};

        // URLSearchParams definition does not enforce array, so we have to do a type check and convert
        if (query.type) {
            if (Array.isArray(query.type)) {
                whereParams.type = In(query.type);
            } else {
                whereParams.type = In([query.type]);
            }
        }
        if (query.supplier) {
            if (Array.isArray(query.supplier)) {
                whereParams.supplier_id = In(query.supplier);
            } else {
                whereParams.supplier_id = In([query.supplier]);
            }
        }
        if (query.sort && query.sortby) {
            if (!enumKeys(ProductSortOptions).includes(query.sortby as ProductSortOptions)) {
                throw new ClientError('Validation error: Invalid field to sort');
            }
            orderParams = {
                [query.sortby]: query.sort === SortDirection.desc ? SortDirection.desc : SortDirection.asc
            };
        }
        try {
            const [product, count] = await AppDataSource.manager.findAndCount(Product, {
                where: whereParams,
                order: orderParams,
                take: itemsPerPage,
                skip: offset,
                relations: ['supplier_id']
            });
            return { status: 'OK', data: product, count };
        } catch (error) {
            console.log(error);
            throw new ClientError(error);
        }
    }

    @httpPost('/add-inventory', defaultAuthHandler([RoutePermissions.create]))
    async createInventory(@requestBody() payload: ProductBodyRequest) {
        let product = new Product();
        product = Object.assign(product, payload);
        product.price = payload.price;
        try {
            await validateOrReject(product);
        } catch (error) {
            throw new ClientError(error);
        }
        try {
            const resp = await AppDataSource.manager.save(Product, { ...payload });
            return { status: 'Created', data: resp };
        } catch (error) {
            // This error is triggered when supplier_id not found
            if (error.code === 'SQLITE_CONSTRAINT')
                throw new ClientError('Validation error: Invalid supplier_id was not found');
        }
    }

    @httpGet('/inventory/:id', defaultAuthHandler([RoutePermissions.view]))
    async getInventoryById(@requestParam('id') productId: string) {
        if (isNaN(Number(productId))) {
            throw new ClientError('Invalid product id', 404);
        }
        const product = await AppDataSource.manager.findOne(Product, {
            where: { id: Number(productId), is_deleted: false },
            relations: ['supplier_id']
        });
        if (!product) {
            throw new ClientError('Not found', 404);
        }
        return { status: 'OK', data: product };
    }

    @httpPatch('/update-inventory/:id', defaultAuthHandler([RoutePermissions.update]))
    async patchInventory(@requestParam('id') productId: string, @requestBody() payload: ProductBodyRequest) {
        let product = new Product();
        product = Object.assign(product, payload);
        product.updated = new Date();

        try {
            await validateOrReject(product, { skipMissingProperties: true });
        } catch (error) {
            throw new ClientError(error);
        }
        if (!Number(productId)) {
            throw new ClientError('Invalid product ID');
        }
        return await AppDataSource.manager.transaction(async () => {
            try {
                await AppDataSource.manager.update(Product, productId, product);
            } catch (error) {
                // This error is triggered when supplier_id not found
                if (error.code === 'SQLITE_CONSTRAINT')
                    throw new ClientError('Validation error: Invalid supplier_id was not found');
            }
            const resp = await AppDataSource.manager.findOne(Product, {
                where: { id: Number(productId), is_deleted: false },
                relations: ['supplier_id']
            });
            if (!resp) {
                throw new ClientError('Not found', 404);
            }
            return { status: 'Updated', data: resp };
        });
    }

    @httpGet('/suppliers')
    async listSupplier() {
        try {
            const [product, count] = await AppDataSource.manager.findAndCount(Supplier);
            return { status: 'OK', data: product, count };
        } catch (error) {
            throw new ClientError(error);
        }
    }

    @httpPatch('/update-supplier/:id', defaultAuthHandler([RoutePermissions.update]))
    async patchSupplier(@requestParam('id') supplierId: string, @requestBody() payload: SupplierBodyRequest) {
        let supplier = new Supplier();
        supplier.name = payload.name;
        supplier.description = payload.description;
        supplier.address = payload.address;
        supplier.phone = payload.phone;
        supplier.logo_url = payload.logo_url;
        supplier.updated = new Date();
        try {
            await validateOrReject(supplier, { skipMissingProperties: true });
        } catch (error) {
            throw new ClientError(error);
        }
        return await AppDataSource.manager.transaction(async () => {
            try {
                await AppDataSource.manager.update(Supplier, supplierId, supplier);
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT') throw new ClientError('Bad Request');
            }
            const resp = await AppDataSource.manager.findOne(Supplier, {
                where: { id: Number(supplierId) }
            });
            if (!resp) {
                throw new ClientError('Not found', 404);
            }
            return { status: 'Updated', data: resp };
        });
    }

    @httpDelete('/delete-inventory/:id', defaultAuthHandler([RoutePermissions.delete]))
    async deleteInventory(@requestParam('id') productId: string) {
        return await AppDataSource.manager.transaction(async () => {
            const product = await AppDataSource.manager.findOne(Product, {
                where: { id: Number(productId), is_deleted: false }
            });
            if (!product) {
                throw new ClientError('Not found', 404);
            }
            await AppDataSource.manager.update(Product, productId, {
                is_deleted: true,
                updated: new Date()
            });
            return { status: 'Deleted' };
        });
    }
}
