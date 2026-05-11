from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PDF_OUTPUT = ROOT / "doc" / "backend-api-list.pdf"
MD_OUTPUT = ROOT / "doc" / "backend-api-list.md"

PAGE = landscape(letter)
NAVY = colors.HexColor("#111827")
SLATE = colors.HexColor("#475569")
MUTED = colors.HexColor("#64748b")
LINE = colors.HexColor("#d8dee9")
SOFT = colors.HexColor("#f8fafc")
BLUE = colors.HexColor("#2563eb")
GREEN = colors.HexColor("#16a34a")
AMBER = colors.HexColor("#d97706")
RED = colors.HexColor("#dc2626")

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="TitleLarge",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=31,
        alignment=TA_CENTER,
        textColor=NAVY,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=SLATE,
        spaceAfter=14,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=NAVY,
        spaceBefore=8,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        fontSize=7.4,
        leading=9.4,
        textColor=SLATE,
    )
)
styles.add(
    ParagraphStyle(
        name="Header",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=7.2,
        leading=8.5,
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="Method",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=7.2,
        leading=8.5,
        textColor=NAVY,
    )
)
styles.add(
    ParagraphStyle(
        name="Note",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11,
        textColor=SLATE,
        spaceAfter=4,
    )
)


GROUPS = [
    {
        "name": "Authentication",
        "color": BLUE,
        "endpoints": [
            ["POST", "/api/auth/login", "Public", "Body: LoginRequest { username, password }", "Returns LoginResponse { id, username, role, tableId, tableLabel, tableSeat, token }."],
        ],
    },
    {
        "name": "Tables",
        "color": GREEN,
        "endpoints": [
            ["GET", "/api/table", "ADMIN, WAITER, CASHIER", "None", "List all restaurant tables."],
            ["GET", "/api/table/{id}", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: id", "Get one table. Customer may use this for their assigned table."],
            ["POST", "/api/table", "ADMIN, WAITER, CASHIER", "Body: RestaurantTable { label, seat, tableStatus, posX, posY }", "Create a table."],
            ["PUT", "/api/table/{id}?userId={userId}", "ADMIN, WAITER, CASHIER", "Path: id; Query: userId; Body: RestaurantTable", "Update label, seats, status, or saved layout position."],
            ["DELETE", "/api/table/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Delete table."],
        ],
    },
    {
        "name": "Users And Table Assignment",
        "color": AMBER,
        "endpoints": [
            ["GET", "/api/user", "ADMIN", "None", "List all users."],
            ["GET", "/api/user/customers", "ADMIN, WAITER, CASHIER", "None", "List customer accounts with table assignment summaries."],
            ["PUT", "/api/user/table-assignments/{tableId}", "ADMIN, WAITER, CASHIER", "Path: tableId; Body: { customerId }", "Assign one customer account to a table or clear assignment with null customerId."],
            ["POST", "/api/user", "ADMIN", "Body: CreateUserRequest { username, password, role, tableId }", "Create user with hashed password."],
            ["PUT", "/api/user/{id}", "ADMIN", "Path: id; Body: User", "Update a user."],
            ["DELETE", "/api/user/{id}", "ADMIN", "Path: id", "Delete a user."],
        ],
    },
    {
        "name": "Orders",
        "color": RED,
        "endpoints": [
            ["GET", "/api/order", "ADMIN, WAITER, CASHIER", "Optional query: date, status, type", "List orders. Supports date/status/type filtering."],
            ["GET", "/api/order/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Get full order with table, customer, and cart items."],
            ["POST", "/api/order", "ADMIN, WAITER, CASHIER, CUSTOMER", "Body: CreateOrderRequest { tableId, userId, orderType, customer }", "Create order directly."],
            ["POST", "/api/order/tables/{tableId}/open?userId={userId}", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: tableId; Query: userId", "Create or reuse current serving order for a table. Customer must match assigned table."],
            ["POST", "/api/order/tables/{tableId}/close", "ADMIN, WAITER, CASHIER", "Path: tableId; Body: CloseOrderRequest { code }", "Force delete active table order and free table. Code checked on backend."],
            ["PUT", "/api/order/{id}", "ADMIN, WAITER, CASHIER", "Body: UpdateOrderRequest", "Update order type/status/payment/method/card/totals."],
            ["PUT", "/api/order/{id}/customer", "ADMIN, WAITER, CASHIER", "Body: UpdateOrderCustomerRequest { name, address, phoneNumber, note }", "Update or attach customer info for an order."],
            ["PUT", "/api/order/{id}/move-table/{newTableId}", "ADMIN, WAITER, CASHIER", "Path: id, newTableId", "Move order to another table and update table occupancy."],
            ["PUT", "/api/order/{id}/checkout", "ADMIN, WAITER, CASHIER", "Body: CheckoutRequest { transactionMethod, cardType, subtotal, tips, tax, total }", "Mark order completed/paid and free dining table."],
            ["DELETE", "/api/order/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Delete order; frees table if it was a dining table order."],
        ],
    },
    {
        "name": "Cart Items And Notes",
        "color": BLUE,
        "endpoints": [
            ["GET", "/api/cart", "ADMIN, WAITER, CASHIER, KITCHEN", "None", "List all cart items."],
            ["GET", "/api/cart/notFinished", "ADMIN, WAITER, CASHIER, KITCHEN", "None", "Kitchen queue: sent items that are not finished."],
            ["GET", "/api/cart/order/{orderId}/notFinished", "ADMIN, WAITER, CASHIER, KITCHEN", "Path: orderId", "Kitchen queue for one order."],
            ["GET", "/api/cart/{id}", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: id", "Get cart item by id."],
            ["GET", "/api/cart/order/{orderId}", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: orderId", "Get cart items for an order."],
            ["POST", "/api/cart", "ADMIN, WAITER, CASHIER, CUSTOMER", "Body: CartItem { orderId, menuItemId, quantity }", "Add item to order. Backend snapshots menu name and price."],
            ["PUT", "/api/cart/{id}", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: id; Body: CartItem", "Update cart item, commonly quantity."],
            ["PUT", "/api/cart/{id}/send", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: id", "Move pending item to sent/preparing state."],
            ["PUT", "/api/cart/{id}/finish", "ADMIN, WAITER, CASHIER, KITCHEN", "Path: id", "Mark kitchen item finished."],
            ["PUT", "/api/cart/{id}/revert-finish", "ADMIN, WAITER, CASHIER, KITCHEN", "Path: id", "Move item back from finished to preparing."],
            ["DELETE", "/api/cart/{id}", "ADMIN, WAITER, CASHIER, CUSTOMER", "Path: id", "Delete cart item and recalculate order total."],
            ["GET", "/api/cart/{cartItemId}/notes", "ADMIN, WAITER, CASHIER", "Path: cartItemId", "List notes for one cart item."],
            ["POST", "/api/cart/{cartItemId}/notes", "ADMIN, WAITER, CASHIER", "Path: cartItemId; Body: CartItemNote { note, price }", "Create staff-only item note/addition."],
            ["PUT", "/api/cart/notes/{noteId}", "ADMIN, WAITER, CASHIER", "Path: noteId; Body: CartItemNote { note, price }", "Update item note/addition."],
            ["DELETE", "/api/cart/notes/{noteId}", "ADMIN, WAITER, CASHIER", "Path: noteId", "Delete item note/addition."],
        ],
    },
    {
        "name": "Menu Items",
        "color": GREEN,
        "endpoints": [
            ["GET", "/api/menuItem", "Authenticated", "None", "List menu items with modifiers."],
            ["GET", "/api/menuItem/{id}", "Authenticated", "Path: id", "Get one menu item."],
            ["POST", "/api/menuItem", "ADMIN, WAITER, CASHIER", "Body: MenuItem { name, price, isAvailable, categories? }", "Create menu item."],
            ["PUT", "/api/menuItem/{id}", "ADMIN, WAITER, CASHIER", "Path: id; Body: MenuItem", "Update menu item price/name/availability."],
            ["DELETE", "/api/menuItem/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Delete menu item. Cart snapshots protect existing orders."],
        ],
    },
    {
        "name": "Menu Item Modifiers",
        "color": AMBER,
        "endpoints": [
            ["GET", "/api/menuItemModifier", "ADMIN, WAITER, CASHIER", "None", "List all modifiers."],
            ["GET", "/api/menuItemModifier/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Get modifier by id."],
            ["GET", "/api/menuItemModifier/menuItem/{menuItemId}", "ADMIN, WAITER, CASHIER", "Path: menuItemId", "List modifiers for one menu item."],
            ["GET", "/api/menuItemModifier/menuItem/{menuItemId}/type/{modifierType}", "ADMIN, WAITER, CASHIER", "Path: menuItemId, modifierType", "List modifiers by type: ADD, NO, SWITCH."],
            ["POST", "/api/menuItemModifier", "ADMIN, WAITER, CASHIER", "Body: MenuItemModifierRequest { menuItemId, modifierType, name, switchTo }", "Create modifier."],
            ["PUT", "/api/menuItemModifier/{id}", "ADMIN, WAITER, CASHIER", "Path: id; Body: MenuItemModifierRequest", "Update modifier."],
            ["DELETE", "/api/menuItemModifier/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Delete one modifier."],
            ["DELETE", "/api/menuItemModifier/menuItem/{menuItemId}", "ADMIN, WAITER, CASHIER", "Path: menuItemId", "Delete all modifiers for a menu item."],
        ],
    },
    {
        "name": "Categories",
        "color": PURPLE if "PURPLE" in globals() else BLUE,
        "endpoints": [
            ["GET", "/api/category", "ADMIN, WAITER, CASHIER", "None", "List categories."],
            ["GET", "/api/category/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Get category by id."],
            ["POST", "/api/category", "ADMIN, WAITER, CASHIER", "Body: Category { name, menuItems? }", "Create category."],
            ["PUT", "/api/category/{id}", "ADMIN, WAITER, CASHIER", "Path: id; Body: Category", "Update category."],
            ["DELETE", "/api/category/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Delete category."],
        ],
    },
    {
        "name": "Customers",
        "color": GREEN,
        "endpoints": [
            ["GET", "/api/customer", "ADMIN, WAITER, CASHIER", "None", "List customer info records."],
            ["GET", "/api/customer/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Get customer by id."],
            ["GET", "/api/customer/phone/{phone}", "ADMIN, WAITER, CASHIER", "Path: phone", "Lookup customer by phone."],
            ["GET", "/api/customer/name/{name}", "ADMIN, WAITER, CASHIER", "Path: name", "Lookup customer by name."],
            ["GET", "/api/customer/address/{address}", "ADMIN, WAITER, CASHIER", "Path: address", "Lookup customer by address."],
            ["POST", "/api/customer", "ADMIN, WAITER, CASHIER", "Body: Customer { name, address, phoneNumber, note }", "Create customer info record."],
            ["PUT", "/api/customer/{id}", "ADMIN, WAITER, CASHIER", "Path: id; Body: Customer", "Update customer info record."],
            ["DELETE", "/api/customer/{id}", "ADMIN, WAITER, CASHIER", "Path: id", "Delete customer info record."],
        ],
    },
]

ENUMS = [
    ["Role", "ADMIN, WAITER, CASHIER, KITCHEN, CUSTOMER"],
    ["OrderType", "DINING, TO_GO, DELIVERY"],
    ["OrderStatus", "SERVING, COMPLETED, CANCELLED"],
    ["PaymentStatus", "UNPAID, PAID"],
    ["TransactionMethod", "NONE, CASH, CARD, SPLIT"],
    ["CardType", "NONE, VISA, MASTERCARD, AMEX, DISCOVER, OTHERS"],
    ["TableStatus", "AVAILABLE, OCCUPIED, RESERVED"],
    ["ModifierType", "ADD, NO, SWITCH"],
]


def p(text, style="Body"):
    return Paragraph(str(text).replace("&", "&amp;"), styles[style])


def endpoint_count():
    return sum(len(group["endpoints"]) for group in GROUPS)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.35 * inch, "Restaurant POS Backend API List")
    canvas.drawRightString(PAGE[0] - doc.rightMargin, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def simple_table(headers, rows, widths):
    data = [[p(h, "Header") for h in headers]]
    data.extend([[p(cell, "Body") for cell in row] for row in rows])
    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("BOX", (0, 0), (-1, -1), 0.4, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT]),
            ]
        )
    )
    return table


def endpoint_table(group):
    rows = []
    for method, path, auth, request, purpose in group["endpoints"]:
        rows.append([method, path, auth, request, purpose])
    table = simple_table(
        ["Method", "Path", "Auth / Roles", "Request", "Purpose / Response"],
        rows,
        [0.55 * inch, 2.35 * inch, 1.55 * inch, 2.2 * inch, 2.65 * inch],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), group["color"]),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
            ]
        )
    )
    return table


def build_pdf():
    doc = SimpleDocTemplate(
        str(PDF_OUTPUT),
        pagesize=PAGE,
        leftMargin=0.45 * inch,
        rightMargin=0.45 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.55 * inch,
    )
    story = []

    generated = datetime.now().strftime("%B %d, %Y")
    story.append(p("Restaurant POS Backend API List", "TitleLarge"))
    story.append(
        p(
            f"Base URL: http://localhost:8080 | Generated: {generated} | "
            f"Total endpoints listed: {endpoint_count()}",
            "Subtitle",
        )
    )
    story.append(
        p(
            "Authentication uses a JWT Bearer token returned from /api/auth/login. "
            "Use Authorization: Bearer <token> for protected endpoints. Spring roles are checked with ROLE_ internally, "
            "but this document lists the role names as they appear in the app.",
            "Note",
        )
    )
    story.append(Spacer(1, 0.08 * inch))
    story.append(
        simple_table(
            ["Role Group", "Members / Meaning"],
            [
                ["STAFF", "ADMIN, WAITER, CASHIER"],
                ["ORDERING", "ADMIN, WAITER, CASHIER, CUSTOMER"],
                ["KITCHEN", "ADMIN, WAITER, CASHIER, KITCHEN"],
                ["Admin-only", "ADMIN"],
            ],
            [1.4 * inch, 7.9 * inch],
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        simple_table(
            ["Enum", "Allowed Values"],
            ENUMS,
            [1.4 * inch, 7.9 * inch],
        )
    )

    story.append(PageBreak())
    for index, group in enumerate(GROUPS):
        story.append(p(group["name"], "Section"))
        story.append(endpoint_table(group))
        if index in {2, 4, 6}:
            story.append(PageBreak())
        else:
            story.append(Spacer(1, 0.12 * inch))

    story.append(PageBreak())
    story.append(p("Common Request Body Shapes", "Section"))
    story.append(
        simple_table(
            ["Name", "Fields"],
            [
                ["LoginRequest", "username, password"],
                ["LoginResponse", "id, username, role, tableId, tableLabel, tableSeat, token"],
                ["CreateUserRequest", "username, password, role, tableId"],
                ["RestaurantTable", "id, label, seat, tableStatus, posX, posY"],
                ["CreateOrderRequest", "tableId, userId, orderType, customer"],
                ["UpdateOrderRequest", "orderType, orderStatus, paymentStatus, transactionMethod, cardType, subtotal, tips, tax, total"],
                ["CheckoutRequest", "transactionMethod, cardType, subtotal, tips, tax, total"],
                ["CloseOrderRequest", "code"],
                ["CartItem", "id, orderId, menuItemId, name, price, quantity, isPending, isFinished, sentAt, finishedAt, notes"],
                ["CartItemNote", "id, cartItemId, note, price, createdAt"],
                ["MenuItem", "id, name, price, isAvailable, modifiers, createdAt, updatedAt"],
                ["MenuItemModifierRequest", "menuItemId, modifierType, name, switchTo"],
                ["Customer", "id, name, address, phoneNumber, note"],
            ],
            [2.1 * inch, 7.2 * inch],
        )
    )

    story.append(Spacer(1, 0.12 * inch))
    story.append(p("Important Backend Rules", "Section"))
    story.append(
        simple_table(
            ["Rule", "Behavior"],
            [
                ["Close code", "Stored in backend application.properties as app.order-close-code=4900; frontend only sends user input."],
                ["Customer table restriction", "Customer can open only their assigned table; other table opens return an error."],
                ["Table release", "Checkout, delete order, close order, or switching dining order to non-dining frees a table."],
                ["Kitchen finish", "Marking an item finished does not free the table or pay the order."],
                ["Item snapshots", "Cart items store name_snapshot and price_snapshot so menu edits do not rewrite order item prices."],
                ["Note pricing", "Each cart item can have many CartItemNote rows; each note may have price 0 or a positive/negative adjustment."],
            ],
            [2.1 * inch, 7.2 * inch],
        )
    )

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


def build_markdown():
    lines = []
    lines.append("# Restaurant POS Backend API List")
    lines.append("")
    lines.append(f"Generated: {datetime.now().strftime('%B %d, %Y')}")
    lines.append("")
    lines.append("Base URL: `http://localhost:8080`")
    lines.append("")
    lines.append("Authentication: use `Authorization: Bearer <token>` after `POST /api/auth/login`.")
    lines.append("")
    lines.append("## Role Groups")
    lines.append("")
    lines.append("| Group | Roles |")
    lines.append("| --- | --- |")
    lines.append("| STAFF | ADMIN, WAITER, CASHIER |")
    lines.append("| ORDERING | ADMIN, WAITER, CASHIER, CUSTOMER |")
    lines.append("| KITCHEN | ADMIN, WAITER, CASHIER, KITCHEN |")
    lines.append("| Admin-only | ADMIN |")
    lines.append("")
    lines.append("## Enums")
    lines.append("")
    lines.append("| Enum | Values |")
    lines.append("| --- | --- |")
    for enum, values in ENUMS:
        lines.append(f"| `{enum}` | `{values}` |")

    for group in GROUPS:
        lines.append("")
        lines.append(f"## {group['name']}")
        lines.append("")
        lines.append("| Method | Path | Auth / Roles | Request | Purpose / Response |")
        lines.append("| --- | --- | --- | --- | --- |")
        for method, path, auth, request, purpose in group["endpoints"]:
            lines.append(
                f"| `{method}` | `{path}` | {auth} | {request} | {purpose} |"
            )

    lines.append("")
    lines.append("## Important Backend Rules")
    lines.append("")
    lines.append("- Close code is stored in backend `application.properties` as `app.order-close-code=4900`.")
    lines.append("- Customer can open only their assigned table.")
    lines.append("- Checkout, delete order, close order, or switching dining order to non-dining frees a table.")
    lines.append("- Kitchen item finish does not free a table.")
    lines.append("- Cart item name/price snapshots protect orders from later menu edits.")
    lines.append("- A cart item can have many notes, each with its own optional price.")
    MD_OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    PDF_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    build_pdf()
    build_markdown()
    print(PDF_OUTPUT)
    print(MD_OUTPUT)
