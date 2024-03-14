import { MigrationInterface, QueryRunner } from "typeorm";

export class Initialize1710165338255 implements MigrationInterface {
    name = 'Initialize1710165338255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "permissions" text NOT NULL, CONSTRAINT "unique_name" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "email" integer, "password" varchar NOT NULL, CONSTRAINT "unique_email" UNIQUE ("email"), CONSTRAINT "unique_username" UNIQUE ("username"))`);
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "created" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "address" varchar, "phone" varchar, "logo_url" varchar, "user_id" integer)`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "release_date" integer NOT NULL, "price" decimal(6,2) NOT NULL, "product_type" text NOT NULL, "is_deleted" integer NOT NULL DEFAULT (0), "created" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "supplier_id" integer, "user_id" integer)`);
        await queryRunner.query(`CREATE TABLE "user_role_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_26736dfb41d6a47ce5d8365aad" ON "user_role_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8188039e9fdf7572245e2ed8a8" ON "user_role_role" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "temporary_supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "created" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "address" varchar, "phone" varchar, "logo_url" varchar, "user_id" integer, CONSTRAINT "FK_1fa5a1933561a9d06eb8ca1f6a6" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_supplier"("id", "name", "description", "created", "updated", "address", "phone", "logo_url", "user_id") SELECT "id", "name", "description", "created", "updated", "address", "phone", "logo_url", "user_id" FROM "supplier"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`ALTER TABLE "temporary_supplier" RENAME TO "supplier"`);
        await queryRunner.query(`CREATE TABLE "temporary_product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "release_date" integer NOT NULL, "price" decimal(6,2) NOT NULL, "product_type" text NOT NULL, "is_deleted" integer NOT NULL DEFAULT (0), "created" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "supplier_id" integer, "user_id" integer, CONSTRAINT "FK_97bbe59fdd40a53bd9c95b6c01b" FOREIGN KEY ("supplier_id") REFERENCES "supplier" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3e59a34134d840e83c2010fac9a" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_product"("id", "name", "description", "release_date", "price", "product_type", "is_deleted", "created", "updated", "supplier_id", "user_id") SELECT "id", "name", "description", "release_date", "price", "product_type", "is_deleted", "created", "updated", "supplier_id", "user_id" FROM "product"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`ALTER TABLE "temporary_product" RENAME TO "product"`);
        await queryRunner.query(`DROP INDEX "IDX_26736dfb41d6a47ce5d8365aad"`);
        await queryRunner.query(`DROP INDEX "IDX_8188039e9fdf7572245e2ed8a8"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_role_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "FK_26736dfb41d6a47ce5d8365aad7" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_8188039e9fdf7572245e2ed8a83" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_role_role"("userId", "roleId") SELECT "userId", "roleId" FROM "user_role_role"`);
        await queryRunner.query(`DROP TABLE "user_role_role"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_role_role" RENAME TO "user_role_role"`);
        await queryRunner.query(`CREATE INDEX "IDX_26736dfb41d6a47ce5d8365aad" ON "user_role_role" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8188039e9fdf7572245e2ed8a8" ON "user_role_role" ("roleId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8188039e9fdf7572245e2ed8a8"`);
        await queryRunner.query(`DROP INDEX "IDX_26736dfb41d6a47ce5d8365aad"`);
        await queryRunner.query(`ALTER TABLE "user_role_role" RENAME TO "temporary_user_role_role"`);
        await queryRunner.query(`CREATE TABLE "user_role_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`INSERT INTO "user_role_role"("userId", "roleId") SELECT "userId", "roleId" FROM "temporary_user_role_role"`);
        await queryRunner.query(`DROP TABLE "temporary_user_role_role"`);
        await queryRunner.query(`CREATE INDEX "IDX_8188039e9fdf7572245e2ed8a8" ON "user_role_role" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_26736dfb41d6a47ce5d8365aad" ON "user_role_role" ("userId") `);
        await queryRunner.query(`ALTER TABLE "product" RENAME TO "temporary_product"`);
        await queryRunner.query(`CREATE TABLE "product" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "release_date" integer NOT NULL, "price" decimal(6,2) NOT NULL, "product_type" text NOT NULL, "is_deleted" integer NOT NULL DEFAULT (0), "created" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "supplier_id" integer, "user_id" integer)`);
        await queryRunner.query(`INSERT INTO "product"("id", "name", "description", "release_date", "price", "product_type", "is_deleted", "created", "updated", "supplier_id", "user_id") SELECT "id", "name", "description", "release_date", "price", "product_type", "is_deleted", "created", "updated", "supplier_id", "user_id" FROM "temporary_product"`);
        await queryRunner.query(`DROP TABLE "temporary_product"`);
        await queryRunner.query(`ALTER TABLE "supplier" RENAME TO "temporary_supplier"`);
        await queryRunner.query(`CREATE TABLE "supplier" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "created" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "address" varchar, "phone" varchar, "logo_url" varchar, "user_id" integer)`);
        await queryRunner.query(`INSERT INTO "supplier"("id", "name", "description", "created", "updated", "address", "phone", "logo_url", "user_id") SELECT "id", "name", "description", "created", "updated", "address", "phone", "logo_url", "user_id" FROM "temporary_supplier"`);
        await queryRunner.query(`DROP TABLE "temporary_supplier"`);
        await queryRunner.query(`DROP INDEX "IDX_8188039e9fdf7572245e2ed8a8"`);
        await queryRunner.query(`DROP INDEX "IDX_26736dfb41d6a47ce5d8365aad"`);
        await queryRunner.query(`DROP TABLE "user_role_role"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
