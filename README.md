# nucleus-be

Inventory Management System.

Inventory management system for mobile phones and accessories

Sample app https://nucleus-be-wanwsqnouq-de.a.run.app/healthcheck/liveness

# Quickstart

Install dependencies

```
// Using node 20
npm i
```

Run migrations

```
npm run migration:run
```

Run locally

```
npm run start
```

Alternatively. build and run in docker

```
docker build --progress=plain . -t nucleus-be:latest
docker run -d --name nucleus-be -p 5000:5000 nucleus-be
```

Run Tests

```
npm run test
```

# Deployment

```
gcloud run deploy
```

# API Specs

### `GET /api/inventory`

| URL Param    | Description (All params optional)                                            |
| ------------ | ---------------------------------------------------------------------------- |
| page         | The page of the result to be returned                                        |
| priceMin     | The minimum price to be returned                                             |
| priceMax     | The maximum price to be returned                                             |
| sort         | Sort order 'asc' or 'desc', needs 'sortby'                                   |
| sortby       | Sort by field name. Accepted fields: 'name', 'release_date', 'price', 'type' |
| supplier[]   | Array of supplier IDs                                                        |
| type[]       | Array of product types. Accepted values: ['phone', 'tablet', 'wearable']     |
| itemsPerPage | Integer denoting the size of the page                                        |

Sample Response:

```json
{
  "status": "OK",
  "data": [
    {
      "id": 1,
      "name": "Ascend G300",
      "description": "The base model Huawei Ascend G300",
      "release_date": "2000-01-01",
      "price": 699.99,
      "type": "phone",
      "supplier_id": {
        "id": 1,
        "name": "Huawei",
        "description": "Huawei Technologies Co., Ltd",
        "address": "46 Jalan Lazat 2 Happy Garden. Off Jalan Kuchai Lama",
        "phone": "05-807-3725",
        "logo_url": "huawei.jpeg"
      }
    }
    ...
  ]
}
```

### `GET /api/inventory/:id`

Where `id` is the id of the product

Sample Response:

```json
{
    "status": "OK",
    "data": {
        "id": 1,
        "name": "Ascend G300",
        "description": "The base model Huawei Ascend G300",
        "release_date": "2000-01-01",
        "price": 699.99,
        "type": "phone",
        "supplier_id": {
            "id": 1,
            "name": "Huawei",
            "description": "Huawei Technologies Co., Ltd",
            "address": "46 Jalan Lazat 2 Happy Garden. Off Jalan Kuchai Lama",
            "phone": "05-807-3725",
            "logo_url": "huawei.jpeg"
        }
    }
}
```

### `POST /api/add-inventory`

| Request Body | Description (All fields are Required)                           |
| ------------ | --------------------------------------------------------------- |
| name         | Name of the product                                             |
| description  | Description of the product                                      |
| supplier_id  | ID of the supplier                                              |
| release_date | Release date of the product, format "YYYY-MM-DD"                |
| type         | Type of product. Accepted values: 'phone', 'tablet', 'wearable' |
| price        | Price of the product in MYR, up to 2 decimal places             |

Sample Response:

```json
{
    "status": "Created",
    "data": {
        "id": 1228,
        "name": "Test Product",
        "description": "This is a test",
        "supplier_id": 3,
        "release_date": "2024-02-01",
        "type": "phone",
        "price": 1000.1,
        "is_deleted": 0,
        "created": "2024-03-06T10:55:57.000Z",
        "updated": "2024-03-06T10:55:57.000Z"
    }
}
```

### `PATCH /api/update-inventory/:id`

Where `id` is the id of the product

| Request Body | Description (All fields are optional)                           |
| ------------ | --------------------------------------------------------------- |
| name         | Name of the product                                             |
| description  | Description of the product                                      |
| supplier_id  | ID of the supplier                                              |
| release_date | Release date of the product, format "YYYY-MM-DD"                |
| type         | Type of product. Accepted values: 'phone', 'tablet', 'wearable' |
| price        | Price of the product in MYR, up to 2 decimal places             |

Sample Response:

```json
{
    "status": "Updated",
    "data": {
        ...
    }
}
```

### `DELETE /api/update-inventory/:id`

Where `id` is the id of the product

Sample Response:

```json
{
    "status": "Deleted"
}
```

### `GET /api/suppliers`

Sample Response:

```json
{
    "status": "OK",
    "data": [
        {
            "id": 1,
            "name": "Huawei",
            "description": "Huawei Technologies Co., Ltd",
            "address": "46 Jalan Lazat 2 Happy Garden. Off Jalan Kuchai Lama",
            "phone": "05-807-3725",
            "logo_url": "huawei.jpeg"
        }
        ...
    ],
    "count": 5
}
```

### `PATCH /api/update-supplier/:id`

##### Not used on frontend, however changes made to suppliers via this endpoint will be reflected on the UI

| Request Body | Description (All fields are optional)   |
| ------------ | --------------------------------------- |
| name         | Name of the supplier                    |
| description  | Description of the supplier             |
| address      | Supplier address                        |
| phone        | Supplier phone number                   |
| logo_url     | Relative url of the supplier logo image |

Sample Response:

```json
{
    "status": "Updated",
    "data": {
        "id": 3,
        "name": "Banana",
        "description": "Orange",
        "address": "JALAN TBP 1, TAMAN BUKIT PELANGI SUBANG JAYA, SELANGOR",
        "phone": "+60 (0)3 8962-2418",
        "logo_url": "apple.png"
    }
}
```

### `POST /auth/login`

| Request Body | Description (All fields are required) |
| ------------ | ------------------------------------- |
| username     | Username                              |
| password     | Password of user                      |

Sample Response:

```json
{
    "id": 4,
    "username": "root",
    "email": null,
    "role": [
        {
            "id": 4,
            "name": "Superadmin",
            "permissions": "[\"create\",\"delete\",\"update\",\"view\",\"user\",\"roles\"]"
        }
    ],
    "token": "jwtToken"
}
```

### `PATCH /auth/update-user/:id`

Where id is the user's ID

| Request Body | Description (All fields are optional)          |
| ------------ | ---------------------------------------------- |
| role         | Array of role IDs. Role IDs must already exist |
| username     | Username                                       |
| password     | Password of user                               |

### `GET /auth/get-users`

Lists all users.

### `GET /auth/upsert-role`

Inserts a new role if the name is unique, otherwise updates the existing role.

Sample Request:

```json
{
    "name": "Superadmin",
    "permissions": ["viewed", "streamer", "user", "roles"]
}
```

Sample Response:

```json
{
    "status": "created",
    "data": {
        "name": "Superadmin",
        "permissions": "[\"viewed\",\"streamer\",\"user\",\"roles\"]",
        "id": 4
    }
}
```
