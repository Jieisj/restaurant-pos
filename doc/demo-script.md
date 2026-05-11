# Short Demo Script

This script can be used during a class presentation or project grading demo.

## Demo Goal

Show that the POS system supports different roles, table assignment, ordering, kitchen workflow, checkout, order management, and admin reporting.

## Before Starting

Start backend:

```bash
cd pos-back/restaurant-pos
./mvnw spring-boot:run
```

Start frontend:

```bash
cd pos-front
npm run dev
```

Open:

```text
http://localhost:5173
```

Use password:

```text
1234
```

## Demo 1: Admin Overview

1. Login as `admin1`.
2. Show the navigation tabs:
   - Tables
   - Menu
   - Cart
   - Kitchen
   - Orders
   - Report
3. Explain that admin has the full system view.

Talking point:

> Admin can use normal POS functions and also view business reports.

## Demo 2: Table Layout And Assignment

1. Go to `Tables`.
2. Show table cards with table status and assigned customer.
3. Long-hold a table card and drag it to show table layout movement.
4. Click `Assign` on a table.
5. Assign or clear a customer account.

Talking point:

> Customer table assignment controls which table a customer can use after login.

## Demo 3: Customer Role Restriction

1. Logout.
2. Login as `customer1`.
3. Show that only customer sections are visible:
   - Tables
   - Menu
   - Cart
4. Show that only the assigned table is available.

Talking point:

> Customer accounts can only order from their assigned table and cannot access checkout, kitchen, orders, reports, or management tools.

## Demo 4: Ordering And Cart

1. As a customer or staff user, open the assigned table.
2. Go to `Menu`.
3. Add an available item.
4. Go to `Cart`.
5. Show pending items.
6. Send item to kitchen.
7. Show the item moves from pending to sent/preparing.

Talking point:

> Pending items can be edited before sending. Sent items are locked because they are already in the kitchen workflow.

## Demo 5: Staff Notes And Additional Prices

1. Logout and login as `waiter1`.
2. Open a table order.
3. Add a menu item.
4. In the cart, add an item note such as `Extra cheese`.
5. Add an optional note price.
6. Show subtotal changes.

Talking point:

> One item can have multiple human-written notes, and each note can have its own price.

## Demo 6: Kitchen Workflow

1. Logout.
2. Login as `kitchen1`.
3. Show kitchen section only.
4. Mark a preparing item as finished.
5. Use revert to move it back to preparing.

Talking point:

> Kitchen finish is item-level only. It does not checkout the order or free the table.

## Demo 7: Checkout And Free Table

1. Login as `admin1` or `waiter1`.
2. Open an active table order.
3. Go to `Cart`.
4. Open checkout modal.
5. Select payment method.
6. If card, select card type.
7. If cash, show quick tender buttons.
8. Confirm checkout.
9. Go back to Tables and show the table becomes available.

Talking point:

> Checkout completes payment and frees the dining table automatically.

## Demo 8: Orders Section

1. Go to `Orders`.
2. Show order cards.
3. Click one order card.
4. Show the order edit modal.
5. Demonstrate:
   - Customer info edit
   - Order type change
   - Item search
   - Item note editing
   - Send selected items to kitchen
   - Delete item
6. Show delete order confirmation, but cancel unless you intentionally want to delete it.

Talking point:

> The orders modal gives staff a controlled way to fix order details without changing menu item prices globally.

## Demo 9: Admin Report

1. Login as `admin1`.
2. Go to `Report`.
3. Show:
   - Gross sales
   - Paid sales
   - Open balance
   - Order counts
   - Top items
   - Recent orders
4. Change date/status/type filters.

Talking point:

> Reports are admin-only and summarize order data from the backend.

## Demo 10: Close Order Code

1. Go to `Tables` as staff.
2. Click `Close` on an occupied table.
3. Explain that this is a force-close action.
4. Enter the close code only if you want to delete the active table order.

Talking point:

> The close code is checked by the backend, not stored in the frontend.

## Suggested Demo Order

For a short presentation, use this order:

1. Admin login and role tabs.
2. Table assignment.
3. Customer restricted login.
4. Add item and send to kitchen.
5. Kitchen finish/revert.
6. Staff checkout.
7. Orders modal.
8. Admin report.

This can be shown in about 5 to 8 minutes.

