# Restaurant POS

Restaurant POS is a full-stack restaurant point-of-sale system built with a React/Vite frontend, a Spring Boot backend, and a MySQL database.

The project supports role-based workflows for:

- Admin
- Waiter
- Cashier
- Kitchen
- Customer

Main features include table assignment, menu management, cart ordering, kitchen tickets, checkout, order editing, admin reports, and customer table-only ordering.

## Quick Start

Run the backend:

```bash
cd pos-back/restaurant-pos
./mvnw spring-boot:run
```

Run the frontend:

```bash
cd pos-front
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:8080/api
```

## Demo Accounts

All seeded demo account passwords are:

```text
1234
```

| Role | Accounts |
| --- | --- |
| Admin | `admin1`, `admin2`, `admin3` |
| Waiter | `waiter1`, `waiter2` |
| Kitchen | `kitchen1` |
| Customer | `customer1`, `customer2`, `customer3`, `customer4`, `customer5`, `customer6` |

## Documentation

Start here:

- [Documentation Index](doc/documentation-index.md)
- [Project Introduction](doc/project-introduction.md)
- [Setup And Run Instructions](doc/setup-and-run.md)
- [Database Setup And ER Diagram](doc/database-setup.md)
- [Demo Script](doc/demo-script.md)
- [Backend API List](doc/backend-api-list.md)
- [Workflow PDF](doc/restaurant-pos-workflow.pdf)
- [Known Limitations And Future Improvements](doc/known-limitations-and-future-improvements.md)

Screenshots are in:

```text
doc/screenshots
```

## Development Notes

During development, run the frontend with:

```bash
npm run dev
```

For a production frontend build:

```bash
npm run build
```

The production frontend output is created in:

```text
pos-front/dist
```
