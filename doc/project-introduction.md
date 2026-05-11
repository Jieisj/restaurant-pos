# Restaurant POS Project Introduction

## Project Overview

Restaurant POS is a role-based point-of-sale system designed for restaurant table ordering, cart management, kitchen preparation, checkout, order tracking, and admin reporting. The project connects a React frontend with a Spring Boot backend and a MySQL database so restaurant staff, kitchen users, administrators, and customers can use different parts of the system based on their role.

The system focuses on the full restaurant order lifecycle: assigning customers to tables, opening table orders, adding menu items, sending items to the kitchen, finishing prepared items, editing orders, checking out payments, freeing tables, and reviewing sales reports.

## Project Purpose

The purpose of this project is to build a practical restaurant POS workflow that keeps table status, orders, cart items, kitchen tickets, payments, and customer assignments synchronized. It is designed to reduce manual tracking errors and make restaurant operations easier for different users.

The project supports:

- Staff placing and managing orders.
- Kitchen users viewing and completing sent food items.
- Customers ordering only from their assigned table.
- Admin users managing system data and viewing reports.
- Table status automatically updating when orders are opened, checked out, deleted, or closed.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript |
| Backend | Spring Boot, Java |
| Database | MySQL |
| Authentication | JWT-based login |
| Styling | React inline styles and global CSS |
| API Style | REST API |

## Main User Roles

### Admin

Admin users have the highest level of access. They can use the normal POS functions and also access the report section.

Admin can:

- Manage tables.
- Manage menu items and modifiers.
- Assign customers to tables.
- Open and manage orders.
- Use the cart and checkout.
- View kitchen tickets.
- Edit and delete orders.
- View reports.

### Waiter and Cashier

Waiter and cashier roles share the main restaurant operation functions. They can handle tables, orders, cart items, kitchen sending, checkout, and order editing.

Waiter and cashier can:

- Open table orders.
- Add menu items to cart.
- Add notes and additional prices to cart items.
- Send items to the kitchen.
- Checkout orders.
- Edit orders.
- Delete orders.
- Assign customers to tables.

### Kitchen

Kitchen users only access the kitchen section. This keeps the kitchen workflow focused on preparing food.

Kitchen can:

- View sent items.
- Mark items as finished.
- Revert finished items back to preparing if needed.

Kitchen cannot:

- Access tables.
- Access menu management.
- Access checkout.
- Access orders.
- Access reports.

### Customer

Customer users are designed for table ordering only. Each customer account can be assigned to one table by staff.

Customer can:

- View only their assigned table.
- Open their assigned table order.
- View menu availability.
- Add menu items to cart.
- Send pending cart items.
- View pending and sent items.

Customer cannot:

- Modify menu availability.
- Add item notes or additional prices.
- Checkout.
- Access table management.
- Access kitchen.
- Access orders.
- Access reports.

## Core Features

## Table Management

The table section shows all restaurant tables for staff users. Tables display their label, seat count, status, and assigned customer. Staff can move tables around the floor layout by long-holding and dragging the whole table card.

Table status changes automatically:

- Opening a dining order marks a table as occupied.
- Checkout frees the table.
- Deleting an order frees the table.
- Closing an active table order frees the table.
- Changing a dining order to To Go or Delivery frees the original table.

## Customer Table Assignment

Staff can assign a customer account to a specific table. When that customer logs in, they only see their assigned table. This prevents customers from accidentally ordering from the wrong table.

The assignment is stored in the backend database through the user table assignment field.

## Menu Management

Staff can manage menu items, prices, availability, and modifiers. Menu items can have modifier options such as:

- Add options.
- Remove options.
- Switch options.

Customers can see whether an item is available, but they cannot modify availability.

## Cart Workflow

After opening a table order, users can add menu items to the cart. Cart items start as pending items. Pending items can still be edited before they are sent to the kitchen.

Staff can add notes to cart items. Each note can have an optional price. For example:

- "No onion" with no extra price.
- "Extra cheese" with an additional price.
- "Add bacon" with an additional price.

These note prices are included in the order subtotal.

## Kitchen Workflow

When cart items are sent, they move from pending status to kitchen preparation status. Kitchen users see sent items in the kitchen section.

Kitchen users can:

- Mark an item as finished.
- Revert a finished item if it was marked by mistake.

Marking an item finished does not complete the order or free the table. The order must still be checked out, deleted, or closed.

## Checkout Workflow

Checkout is available for staff roles. The checkout modal supports payment information such as:

- Cash.
- Card.
- Split payment.
- Card type selection.
- Tips.
- Tax.
- Total calculation.

For cash payments, quick tender shortcuts help calculate the amount received and change due.

When checkout is completed, the order becomes paid and completed. If the order is a dining table order, the table becomes available again.

## Orders Section

The orders section displays orders as cards. By default, serving orders are shown first so staff can focus on active orders.

Clicking an order opens an edit modal where staff can:

- Update customer information.
- Change order type.
- Edit item prices for that order only.
- Delete items.
- Add, edit, or delete item notes.
- Search items inside the modal.
- Resend selected items to the kitchen.
- Resend the full order to the kitchen.
- Delete the order after confirmation.

Deleting a dining order also frees its table.

## Admin Report Section

Only admin users can see the report section. The report summarizes order and sales data from the backend order API.

The report includes:

- Gross sales.
- Paid sales.
- Open balance.
- Average order value.
- Order counts.
- Item counts.
- Tax and tips.
- Order status summary.
- Order type summary.
- Payment method summary.
- Top items.
- Recent orders.

## Backend API

The backend exposes REST APIs for:

- Authentication.
- Tables.
- Users.
- Customer table assignments.
- Menu items.
- Menu modifiers.
- Categories.
- Cart items.
- Cart item notes.
- Orders.
- Customers.

JWT authentication protects most endpoints. Role-based rules decide which users can access each API.

## Database Design

The MySQL database stores the main POS data:

- Users and roles.
- Customer table assignments.
- Restaurant tables.
- Menu items.
- Menu modifiers.
- Categories.
- Orders.
- Cart items.
- Cart item notes.
- Customer information.

Cart items store snapshots of menu item names and prices. This is important because changing a menu item later should not change the price or name of an item already added to an order.

## Important Business Rules

- A customer can only open their assigned table.
- Customers cannot checkout.
- Customers cannot add priced notes.
- Kitchen can only manage kitchen preparation.
- Admin is the only role with report access.
- Checkout frees the table for dining orders.
- Deleting an order frees the table for dining orders.
- Closing an active table order frees the table.
- Marking kitchen items finished does not free the table.
- Menu price changes do not affect existing cart item snapshots.
- The preset close code is stored in the backend, not the frontend.

## Current Demo Accounts

All seeded demo accounts use the password:

```text
1234
```

| Role | Accounts |
| --- | --- |
| Admin | admin1, admin2, admin3 |
| Waiter | waiter1, waiter2 |
| Kitchen | kitchen1 |
| Customer | customer1, customer2, customer3, customer4, customer5, customer6 |

## Customer Table Assignments

| Customer | Assigned Table |
| --- | --- |
| customer1 | T1 |
| customer2 | T2 |
| customer3 | T3 |
| customer4 | T4 |
| customer5 | T5 |
| customer6 | T6 |

## Conclusion

Restaurant POS provides a complete restaurant ordering workflow with separate interfaces for staff, kitchen, admin, and customer users. The project demonstrates role-based access control, frontend and backend synchronization, table occupancy management, kitchen ticket handling, checkout processing, and admin reporting.

The system is designed to be practical for real restaurant operations while also being clear enough for testing, demonstration, and future expansion.
