# Setup And Run Instructions

This guide explains how to run the Restaurant POS project from source code on a local machine.

## Requirements

- Java 17 or newer
- Node.js 18 or newer
- MySQL 8.x
- A terminal
- Git

The project has two main apps:

- Frontend: `pos-front`
- Backend: `pos-back/restaurant-pos`

## 1. Clone The Project

```bash
git clone <your-repository-url>
cd restaurant-pos
```

## 2. Create The MySQL Database

Open MySQL and create the database:

```sql
CREATE DATABASE restaurant_pos;
```

The default local backend configuration expects:

```text
Database: restaurant_pos
Username: root
Password: admin
Port: 3306
```

These values are stored in:

```text
pos-back/restaurant-pos/src/main/resources/application.properties
```

For another computer, update those values to match that computer's MySQL setup.

## 3. Import Database SQL

The project includes a baseline dump and a notes migration:

```text
doc/Dump20260503.sql
doc/cart-item-notes-migration.sql
```

Import the baseline dump:

```bash
mysql -u root -p restaurant_pos < doc/Dump20260503.sql
```

Then apply the cart item notes migration if the table does not already exist:

```bash
mysql -u root -p restaurant_pos < doc/cart-item-notes-migration.sql
```

After importing, the backend uses:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

That means Spring Boot will check whether the database schema matches the Java entities. If the schema is missing a required table or column, the backend will fail during startup instead of silently changing the database.

## 4. Run The Backend

From the backend folder:

```bash
cd pos-back/restaurant-pos
./mvnw spring-boot:run
```

The backend should start at:

```text
http://localhost:8080
```

The API base path is:

```text
http://localhost:8080/api
```

## 5. Run The Frontend

Open a second terminal from the project root:

```bash
cd pos-front
npm install
npm run dev
```

The frontend should start at:

```text
http://localhost:5173
```

During development, Vite compiles the frontend in memory. You do not need to build the frontend before running it locally.

## 6. Production Build Check

Before submitting or deploying, run a production build check:

```bash
cd pos-front
npm run build
```

This creates:

```text
pos-front/dist
```

The `dist` folder is the production frontend output for a static host such as Nginx or Netlify.

For backend packaging:

```bash
cd pos-back/restaurant-pos
./mvnw package
```

This creates a packaged Spring Boot artifact under:

```text
pos-back/restaurant-pos/target
```

## 7. Demo Login Accounts

All seeded demo accounts use:

```text
Password: 1234
```

| Role | Accounts |
| --- | --- |
| Admin | `admin1`, `admin2`, `admin3` |
| Waiter | `waiter1`, `waiter2` |
| Kitchen | `kitchen1` |
| Customer | `customer1`, `customer2`, `customer3`, `customer4`, `customer5`, `customer6` |

Customer table assignment:

| Customer | Assigned Table |
| --- | --- |
| `customer1` | `T1` |
| `customer2` | `T2` |
| `customer3` | `T3` |
| `customer4` | `T4` |
| `customer5` | `T5` |
| `customer6` | `T6` |

## 8. Quick Verification

Use this checklist after setup:

- Backend starts on port `8080`.
- Frontend starts on port `5173`.
- Login works with `admin1` / `1234`.
- Admin can see `Tables`, `Menu`, `Cart`, `Kitchen`, `Orders`, and `Report`.
- Kitchen user can only see the kitchen page.
- Customer user can only see the assigned table, menu, and cart.
- Sending an item from cart makes it appear in the kitchen section.
- Checkout or deleting a dining order frees the table.

## 9. Common Problems

### Backend cannot connect to MySQL

Check:

- MySQL is running.
- Database name is `restaurant_pos`.
- Username/password match `application.properties`.
- MySQL port is `3306`.

### Frontend request fails

Check:

- Backend is running at `http://localhost:8080`.
- Frontend is running at `http://localhost:5173`.
- CORS in backend allows `http://localhost:5173`.

### Backend schema validation fails

The database schema does not match the Java entity classes. Recheck the SQL import and migration notes in [database-setup.md](database-setup.md).

