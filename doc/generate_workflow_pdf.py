from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "doc" / "restaurant-pos-workflow.pdf"

NAVY = colors.HexColor("#111827")
SLATE = colors.HexColor("#475569")
MUTED = colors.HexColor("#64748b")
LINE = colors.HexColor("#d8dee9")
SOFT = colors.HexColor("#f8fafc")
BLUE = colors.HexColor("#2563eb")
GREEN = colors.HexColor("#16a34a")
AMBER = colors.HexColor("#d97706")
RED = colors.HexColor("#dc2626")
PURPLE = colors.HexColor("#7c3aed")


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=NAVY,
        alignment=TA_CENTER,
        spaceAfter=16,
    )
)
styles.add(
    ParagraphStyle(
        name="CoverSubtitle",
        parent=styles["Normal"],
        fontSize=12,
        leading=17,
        textColor=SLATE,
        alignment=TA_CENTER,
        spaceAfter=20,
    )
)
styles.add(
    ParagraphStyle(
        name="SectionTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=22,
        textColor=NAVY,
        spaceBefore=6,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="SubTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=NAVY,
        spaceBefore=6,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        fontSize=9.5,
        leading=13.5,
        textColor=SLATE,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Tiny",
        parent=styles["BodyText"],
        fontSize=7.5,
        leading=9.5,
        textColor=SLATE,
    )
)
styles.add(
    ParagraphStyle(
        name="BoxTitle",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=10.5,
        textColor=NAVY,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        name="BoxText",
        parent=styles["BodyText"],
        fontSize=7.2,
        leading=9,
        textColor=SLATE,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        name="TableHeader",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=10,
        textColor=colors.white,
    )
)
styles.add(
    ParagraphStyle(
        name="TableCell",
        parent=styles["BodyText"],
        fontSize=8,
        leading=10,
        textColor=SLATE,
    )
)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullets(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=10) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontSize=6,
        bulletOffsetY=1,
    )


def chip(text, color):
    return Table(
        [[p(text, "Tiny")]],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), color),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 0.25, color),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ],
    )


def flow_row(steps, color=BLUE):
    row = []
    widths = []
    for index, (title, text) in enumerate(steps):
        row.append([p(title, "BoxTitle"), p(text, "BoxText")])
        widths.append(1.25 * inch)
        if index < len(steps) - 1:
            row.append(p("->", "BoxTitle"))
            widths.append(0.22 * inch)

    table = Table([row], colWidths=widths)
    style = TableStyle(
        [
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )

    for col in range(0, len(row), 2):
        style.add("BACKGROUND", (col, 0), (col, 0), colors.HexColor("#ffffff"))
        style.add("BOX", (col, 0), (col, 0), 0.8, color)
        style.add("ROUNDEDCORNERS", (col, 0), (col, 0), 6)
    table.setStyle(style)
    return table


def simple_table(headers, rows, widths=None):
    data = [[p(h, "TableHeader") for h in headers]]
    data.extend([[p(str(cell), "TableCell") for cell in row] for row in rows])
    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT]),
            ]
        )
    )
    return table


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 0.45 * inch, "Restaurant POS Workflow")
    canvas.drawRightString(
        letter[0] - doc.rightMargin,
        0.45 * inch,
        f"Page {doc.page}",
    )
    canvas.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.65 * inch,
    )

    story = []
    generated = datetime.now().strftime("%B %d, %Y")

    story.append(Spacer(1, 0.8 * inch))
    story.append(p("Restaurant POS Project Workflow", "CoverTitle"))
    story.append(
        p(
            "Frontend cart, table, menu, kitchen, order, and admin report flows "
            "with backend/API and MySQL data lifecycle.",
            "CoverSubtitle",
        )
    )
    story.append(
        simple_table(
            ["Area", "Implementation"],
            [
                ["Frontend", "React POS UI: tables, menu, cart, kitchen, orders, report"],
                ["Backend", "Spring Boot REST API with JWT security and service layer"],
                ["Database", "MySQL schema: users, tables, orders, cart items, notes, menu data"],
                ["Generated", generated],
            ],
            [1.5 * inch, 5.1 * inch],
        )
    )
    story.append(Spacer(1, 0.3 * inch))
    story.append(
        flow_row(
            [
                ("User Login", "JWT token and role loaded"),
                ("Role UI", "Tabs are filtered per role"),
                ("POS Actions", "Tables, menu, cart, kitchen, orders"),
                ("Spring API", "Controllers validate and update state"),
                ("MySQL", "Orders, items, notes, tables stay synced"),
            ],
            BLUE,
        )
    )

    story.append(PageBreak())

    story.append(p("1. System Overview", "SectionTitle"))
    story.append(
        p(
            "The application is a role-based restaurant POS. The React frontend "
            "calls Spring Boot REST endpoints through API helper modules. The "
            "backend stores the authoritative state in MySQL and uses JWT-based "
            "authentication to control access.",
        )
    )
    story.append(
        simple_table(
            ["Layer", "Responsibilities", "Important Files"],
            [
                [
                    "React frontend",
                    "Role tabs, table layout, menu cards, cart, kitchen tickets, order modal, report view.",
                    "pos-front/src/features/pos/pages/POSPage.jsx; pos-front/src/features/pos/components/*",
                ],
                [
                    "API client",
                    "Adds auth token, sends CRUD requests, maps frontend actions to backend endpoints.",
                    "pos-front/src/api/*.js; pos-front/src/features/auth/api/authApi.js",
                ],
                [
                    "Spring controllers",
                    "Expose REST endpoints for auth, tables, menu, cart, orders, users, customers.",
                    "pos-back/restaurant-pos/src/main/java/.../controller/*",
                ],
                [
                    "Service layer",
                    "Business rules: customer table restriction, table freeing, totals, checkout, close code.",
                    "OrderService.java, CartItemService.java, UserService.java",
                ],
                [
                    "MySQL",
                    "Stores users, table position/status, orders, menu items, cart items, item notes.",
                    "restaurant_pos database",
                ],
            ],
            [1.1 * inch, 2.7 * inch, 2.8 * inch],
        )
    )

    story.append(Spacer(1, 0.15 * inch))
    story.append(p("Role Access Summary", "SubTitle"))
    story.append(
        simple_table(
            ["Role", "Visible Sections", "Main Actions"],
            [
                [
                    "Admin",
                    "Tables, Menu, Cart, Kitchen, Orders, Report",
                    "Full POS operation plus report access, menu/table/order management.",
                ],
                [
                    "Waiter/Cashier",
                    "Tables, Menu, Cart, Kitchen, Orders",
                    "Open tables, place orders, send kitchen items, checkout, edit orders.",
                ],
                [
                    "Kitchen",
                    "Kitchen only",
                    "See sent items, mark finished, revert finished item when needed.",
                ],
                [
                    "Customer",
                    "Tables, Menu, Cart",
                    "Open assigned table only, order menu items, view pending/sent cart state.",
                ],
            ],
            [1.05 * inch, 2.35 * inch, 3.2 * inch],
        )
    )

    story.append(PageBreak())

    story.append(p("2. Authentication And Role Routing", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Login Form", "username/password"),
                ("Auth API", "POST /api/auth/login"),
                ("JWT Response", "role, userId, table assignment"),
                ("POSPage", "default tab and allowed tabs"),
                ("API Calls", "Authorization header"),
            ],
            PURPLE,
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        bullets(
            [
                "Admin gets the report tab; kitchen gets only the kitchen tab.",
                "Customer starts in the table flow and only loads the assigned table.",
                "If the customer tries to open a different table, the backend rejects it.",
                "The frontend stores only the session token and display role data; backend keeps the source of truth.",
            ]
        )
    )

    story.append(p("3. Table And Customer Assignment Workflow", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Staff Tables", "load all tables and customers"),
                ("Assign", "select customer for a table"),
                ("Backend", "PUT /api/user/table-assignments/{tableId}"),
                ("Customer Login", "tableId returned"),
                ("Customer View", "only assigned table is visible"),
            ],
            GREEN,
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        bullets(
            [
                "Staff can drag table cards by long-holding the whole card, not a hidden drag button.",
                "Table position saves through the table update API and is stored as posX/posY.",
                "Customer assignments are stored on users.table_id.",
                "Opening a table creates or reuses a serving order and marks that table occupied.",
            ]
        )
    )

    story.append(PageBreak())

    story.append(p("4. Ordering, Cart, And Kitchen Workflow", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Open Table", "create/reuse serving order"),
                ("Menu", "add available item"),
                ("Cart Pending", "edit qty and notes before sending"),
                ("Send", "is_pending = false"),
                ("Kitchen", "preparing ticket appears"),
            ],
            BLUE,
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        simple_table(
            ["Step", "What Happens", "Data Updated"],
            [
                [
                    "Open table",
                    "OrderService returns active serving order or creates a new one.",
                    "orders, res_tables.table_status",
                ],
                [
                    "Add item",
                    "Cart item uses menu item snapshots so later menu price changes do not change the order.",
                    "cart_items.name_snapshot, price_snapshot",
                ],
                [
                    "Add note/addition",
                    "Staff can add many notes; each note may have a price. Customers cannot add notes.",
                    "cart_item_notes",
                ],
                [
                    "Send item",
                    "Item moves from pending cart to sent/preparing state.",
                    "cart_items.is_pending, sent_at",
                ],
                [
                    "Kitchen finish",
                    "Kitchen marks item finished and can revert it if pressed by mistake.",
                    "cart_items.is_finished, finished_at",
                ],
            ],
            [1.05 * inch, 3.55 * inch, 2.0 * inch],
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        p(
            "Kitchen finished status does not free a table. A table is freed by checkout, order delete, close order, "
            "or changing an active dining order away from dining."
        )
    )

    story.append(p("5. Checkout Workflow", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Cart", "staff opens checkout"),
                ("Payment", "cash/card/split and card type"),
                ("Cash Shortcut", "quick tender amounts"),
                ("Backend", "PUT /api/order/{id}/checkout"),
                ("Table Free", "completed paid dining order releases table"),
            ],
            GREEN,
        )
    )
    story.append(
        bullets(
            [
                "Customer role has no checkout button; customers can only place and review their order.",
                "Decimal money inputs are constrained to two decimal places in the UI.",
                "Checkout sets order_status COMPLETED and payment_status PAID.",
            ]
        )
    )

    story.append(PageBreak())

    story.append(p("6. Orders Section Workflow", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Order Cards", "default serving filter"),
                ("Click Card", "open edit modal"),
                ("Edit Details", "customer/type/table/items/notes/prices"),
                ("Resend", "send selected or full order to kitchen"),
                ("Save/Delete", "refresh tables, cart, kitchen, orders"),
            ],
            AMBER,
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        simple_table(
            ["Feature", "Workflow"],
            [
                [
                    "Search in modal",
                    "Items can be searched by name, status, price, or note to handle long orders.",
                ],
                [
                    "Select visible",
                    "Visible items can be selected and resent to the kitchen if a ticket was missed.",
                ],
                [
                    "Edit order type",
                    "Dining can become To Go or Delivery; the previous table is freed.",
                ],
                [
                    "Delete item",
                    "Item delete recalculates totals and refreshes the modal/order list.",
                ],
                [
                    "Delete order",
                    "Two-step confirmation protects against accidental deletion; table is freed if applicable.",
                ],
            ],
            [1.55 * inch, 5.05 * inch],
        )
    )

    story.append(p("7. Close Order And Delete Safety", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Close Button", "occupied table only"),
                ("Code Modal", "staff enters preset code"),
                ("Backend Check", "app.order-close-code"),
                ("Delete Order", "active order removed"),
                ("Free Table", "table returns AVAILABLE"),
            ],
            RED,
        )
    )
    story.append(
        bullets(
            [
                "The close code is stored in backend application.properties, not frontend code.",
                "Delete order from the orders modal also frees the table for dining orders.",
                "Close order is for force-closing an active table order; checkout is the normal paid flow.",
            ]
        )
    )

    story.append(PageBreak())

    story.append(p("8. Admin Report Workflow", "SectionTitle"))
    story.append(
        flow_row(
            [
                ("Admin Tab", "Report visible only to admin"),
                ("Load Orders", "GET /api/order"),
                ("Filter", "date/status/type"),
                ("Summarize", "sales, payments, items"),
                ("Refresh", "reload latest orders"),
            ],
            PURPLE,
        )
    )
    story.append(
        bullets(
            [
                "Report calculations are frontend summaries from the orders endpoint.",
                "Metrics include gross sales, paid sales, open balance, average order, counts, type mix, payment mix, and top items.",
                "Kitchen, customer, waiter, and cashier roles do not see the report tab.",
            ]
        )
    )

    story.append(p("9. Backend Endpoint Map", "SectionTitle"))
    story.append(
        simple_table(
            ["Domain", "Important Endpoints"],
            [
                ["Auth", "POST /api/auth/login"],
                ["Tables", "GET/POST/PUT/DELETE /api/table; GET /api/table/{id}"],
                ["Users", "GET /api/user/customers; PUT /api/user/table-assignments/{tableId}"],
                ["Menu", "GET/POST/PUT/DELETE /api/menuItem; modifier CRUD under /api/menuItemModifier"],
                ["Cart", "POST /api/cart; PUT /api/cart/{id}; send/finish/revert; notes CRUD"],
                ["Orders", "GET /api/order; open/close table; update; customer update; move-table; checkout; delete"],
                ["Customers", "GET/POST/PUT/DELETE /api/customer"],
            ],
            [1.2 * inch, 5.4 * inch],
        )
    )

    story.append(Spacer(1, 0.15 * inch))
    story.append(p("10. Data Lifecycle Rules", "SectionTitle"))
    story.append(
        simple_table(
            ["Rule", "Why It Matters"],
            [
                [
                    "Orders snapshot item names and prices.",
                    "Changing the menu later does not rewrite historical or active order prices.",
                ],
                [
                    "Notes are separate rows with optional prices.",
                    "One cart item can have many human-written notes/additions.",
                ],
                [
                    "Dining order owns table occupancy.",
                    "Checkout, delete, close, or changing to non-dining frees the table.",
                ],
                [
                    "Kitchen finish is item-level only.",
                    "Food completion does not imply payment or table release.",
                ],
                [
                    "Customer table assignment is user-level.",
                    "Customer accounts can only open the table assigned by staff/admin.",
                ],
            ],
            [2.15 * inch, 4.45 * inch],
        )
    )

    story.append(PageBreak())

    story.append(p("11. Current Demo Test Data", "SectionTitle"))
    story.append(
        p(
            "The local database was reset for testing with the following seeded accounts. "
            "All seeded account passwords are 1234."
        )
    )
    story.append(
        simple_table(
            ["Role", "Accounts"],
            [
                ["Admin", "admin1, admin2, admin3"],
                ["Waiter", "waiter1, waiter2"],
                ["Kitchen", "kitchen1"],
                ["Customer", "customer1, customer2, customer3, customer4, customer5, customer6"],
            ],
            [1.15 * inch, 5.45 * inch],
        )
    )
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        simple_table(
            ["Customer", "Assigned Table"],
            [
                ["customer1", "T1"],
                ["customer2", "T2"],
                ["customer3", "T3"],
                ["customer4", "T4"],
                ["customer5", "T5"],
                ["customer6", "T6"],
            ],
            [2.0 * inch, 2.0 * inch],
        )
    )
    story.append(
        p(
            "Seeded workflow data includes serving dining orders on T1 and T2, completed orders for report testing, "
            "one cancelled order, menu categories, modifiers, and kitchen-visible sent items."
        )
    )

    story.append(Spacer(1, 0.18 * inch))
    story.append(
        KeepTogether(
            [
                p("Quick Manual Regression Path", "SubTitle"),
                bullets(
                    [
                        "Login admin1 -> confirm Tables, Menu, Cart, Kitchen, Orders, Report.",
                        "Long-hold a table card -> drag -> position persists after refresh.",
                        "Assign customer3 to a table -> login customer3 -> only that table appears.",
                        "Open a table -> add menu item -> send to kitchen -> kitchen1 sees ticket.",
                        "Mark finished -> revert finished -> item returns to preparing.",
                        "Checkout a dining order -> table becomes AVAILABLE.",
                        "Delete or close a table order -> table becomes AVAILABLE.",
                    ]
                ),
            ]
        )
    )

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    build_pdf()
    print(OUTPUT)
