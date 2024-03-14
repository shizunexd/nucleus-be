import ProductType from '../entities/ProductType';
import { AppDataSource } from '../data-source';
import { readFileSync } from 'fs';
import enumKeys from '../utils/enumKeys';
import { Supplier } from '../entities/Supplier';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import bcrypt from 'bcrypt';
import { RoutePermissions } from '../middlewares/default-auth';
const supplierNames = ['huawei', 'samsung', 'apple', 'microsoft', 'xiaomi'];
const supplierDescription = [
    'Huawei Technologies Co., Ltd',
    'Samsung Electronics Co., Ltd',
    'Apple Inc.',
    'Microsoft Corporation',
    'Xiaomi Corporation'
];
const supplierAddresses = [
    '46 Jalan Lazat 2 Happy Garden. Off Jalan Kuchai Lama',
    'Lot 2-56 & 57 2nd Floor Low Yat Plaza',
    'JALAN TBP 1, TAMAN BUKIT PELANGI SUBANG JAYA, SELANGOR',
    '2 58 Jln Radin Tengah Taman Seri Petaling',
    'No. 23 A Jln Pandan Indah 1/23B Taman Pandan Indah'
];
const supplierIcons = ['huawei.jpeg', 'samsung.png', 'apple.png', 'microsoft.png', 'xiaomi.png'];
const supplierPhones = ['05-807-3725', '03-56318628', '+60 (0)3 8962-2418', '603 907 60863', '6084331839'];
const minPrice = 699.99;
const maxPrice = 8899.99;
const increment = 200;
const maxProductsBeforeCeiling = 40;
const minProductsBeforeFloor = 20;

const minYear = 2000;
const maxYear = 2024;
const totalYears = 25;

function capitalize(word: String) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export default async function loadDefaultData() {
    return await AppDataSource.manager.transaction(async () => {
        await AppDataSource.manager.query('DELETE FROM product');
        await AppDataSource.manager.query('DELETE FROM sqlite_sequence where name="product"');
        await AppDataSource.manager.query('DELETE FROM user');
        await AppDataSource.manager.query('DELETE FROM sqlite_sequence where name="user";');
        await AppDataSource.manager.query('DELETE FROM role');
        await AppDataSource.manager.query('DELETE FROM sqlite_sequence where name="role";');
        await AppDataSource.manager.query('DELETE FROM supplier');
        await AppDataSource.manager.query('DELETE FROM sqlite_sequence where name="supplier";');

        // Input sample Roles
        const viewer = new Role();
        viewer.name = 'Viewer';
        viewer.permissions = JSON.stringify([RoutePermissions.view]);

        const editor = new Role();
        editor.name = 'Editor';
        editor.permissions = JSON.stringify([RoutePermissions.create, RoutePermissions.update, RoutePermissions.view]);

        const admin = new Role();
        admin.name = 'Admin';
        admin.permissions = JSON.stringify([
            RoutePermissions.create,
            RoutePermissions.delete,
            RoutePermissions.update,
            RoutePermissions.view
        ]);

        const superadmin = new Role();
        superadmin.name = 'Superadmin';
        superadmin.permissions = JSON.stringify([
            RoutePermissions.create,
            RoutePermissions.delete,
            RoutePermissions.update,
            RoutePermissions.view,
            RoutePermissions.user,
            RoutePermissions.roles
        ]);

        const defaultRoles = await AppDataSource.manager.save([viewer, editor, admin, superadmin]);

        // Input sample Users
        const hashedPw = await bcrypt.hash('password', 10);
        const viewerUser = new User();
        viewerUser.username = 'generic_viewer';
        viewerUser.password = hashedPw;
        viewerUser.role = [defaultRoles[0]];

        const editorUser = new User();
        editorUser.username = 'editor';
        editorUser.password = hashedPw;
        editorUser.role = [defaultRoles[1]];

        const adminUser = new User();
        adminUser.username = 'admin';
        adminUser.password = hashedPw;
        adminUser.role = [defaultRoles[2]];

        const superadminUser = new User();
        superadminUser.username = 'root';
        superadminUser.password = hashedPw;
        superadminUser.role = [defaultRoles[3]];

        await AppDataSource.manager.save([viewerUser, editorUser, adminUser, superadminUser]);

        // Input supplier data
        for (const [c, supplier] of supplierNames.entries()) {
            const sp = new Supplier();
            sp.name = capitalize(supplier);
            sp.address = supplierAddresses[c];
            sp.phone = supplierPhones[c];
            sp.description = supplierDescription[c];
            sp.logo_url = supplierIcons[c];
            await AppDataSource.manager.insert(Supplier, sp);
        }

        let productQuery = `insert into product('name', description, release_date, price, product_type, supplier_id)
            values`;
        // Build the raw query from the sample data
        for (let type of enumKeys(ProductType)) {
            for (let supplier of supplierNames) {
                const filestream = readFileSync(`${process.cwd()}/src/scripts/sample_data/${type}/${supplier}.txt`, {
                    encoding: 'utf-8'
                });
                const countLines = filestream.match(/\r?\n/g).length;
                const filelines = filestream.split('\n');
                let productCounter = 0;
                for await (const line of filelines) {
                    // Allocate the release dates and price evenly
                    let price = minPrice;
                    let year = minYear;
                    if (countLines > maxProductsBeforeCeiling) {
                        price =
                            minPrice + Math.floor((productCounter / countLines) * maxProductsBeforeCeiling) * increment;
                    } else if (countLines < minProductsBeforeFloor) {
                        price = minPrice + (productCounter + 10) * increment;
                    } else {
                        price = minPrice + productCounter * increment;
                    }
                    year = minYear + Math.floor((productCounter / countLines) * totalYears);
                    const re = new RegExp(supplier, 'i');
                    productQuery += `('${line.replace(re, '').trim()}', 'The base model ${line.trim()}', '${year}-01-01', ${price}, '${type}', ${supplierNames.indexOf(supplier) + 1}),`;
                    // The default product list has 612 products, adding this line to duplicate the products for 1.2k products in total
                    productQuery += `('New V2 ${line.replace(re, '').trim()}', 'The new and improved ${line.trim()}!', '${year + 1}-01-01', ${price + 1000}, '${type}', ${supplierNames.indexOf(supplier) + 1}),`;
                    productCounter += 1;
                }
            }
        }
        productQuery = productQuery.substring(0, productQuery.length - 1);
        await AppDataSource.manager.query(productQuery);
    });
}
