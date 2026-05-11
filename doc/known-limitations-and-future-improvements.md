# Known Limitations And Future Improvements

This project is complete enough for a school project and demo, but it is still an MVP-style restaurant POS. The following limitations and future improvements can be mentioned in a report or presentation.

## Known Limitations

## Security And Configuration

- Local database credentials are stored in `application.properties`.
- The order close code is currently configured as a backend property.
- There is no password reset workflow.
- There is no login rate limiting.
- JWT refresh tokens are not implemented.

## Database And Migration

- Database setup currently uses SQL dump and manual migration notes.
- A formal migration tool such as Flyway or Liquibase is not yet configured.
- Seed data is designed for demo testing, not production.

## Payment

- Checkout records payment method and totals, but it does not connect to a real payment gateway.
- Card type is selected manually.
- No real card terminal integration exists.
- Receipt printing is not implemented.

## Reporting

- The report section summarizes order data inside the frontend.
- Reports are not exported to CSV or PDF yet.
- There is no shift close or day close report.
- There is no profit/cost analysis.

## Audit And History

- Deleted orders are removed instead of being archived.
- There is no audit log for who deleted or force-closed an order.
- There is no manager approval workflow beyond the close code.

## User Management

- Admin can create and update users through backend APIs, but the frontend user-management screen is limited.
- Role permissions are hard-coded in the backend security configuration.
- Customer accounts are assigned to tables manually by staff.

## UI And Device Support

- The UI is optimized for browser use, but it has not been fully tested on all tablet sizes.
- Table drag behavior works by long-holding cards, but there is no grid snap or collision prevention yet.
- There is no offline mode if the backend or database is unavailable.

## Operations

- No Docker deployment configuration is included yet.
- No Nginx production configuration is included yet.
- No automated database backup script is included.
- Monitoring and alerting are not configured.

## Future Improvements

## Production Deployment

- Move database credentials, JWT secret, and close code into environment variables.
- Add Docker Compose for frontend, backend, and MySQL.
- Add Nginx reverse proxy configuration.
- Add HTTPS in production.
- Add production CORS configuration for the real domain.

## Database Migrations

- Add Flyway or Liquibase.
- Create migration files for every schema change.
- Add a repeatable seed script for demo data.
- Add backup and restore documentation.

## Payment And Receipt Support

- Add receipt printing.
- Add payment terminal integration.
- Add refund and void workflow.
- Add cash drawer integration.
- Add receipt history.

## Audit Logging

- Log order deletion.
- Log force-close actions.
- Log checkout actions.
- Log user login failures.
- Log table assignment changes.

## Reporting

- Export reports to PDF and CSV.
- Add date range comparison.
- Add daily close report.
- Add staff sales report.
- Add item popularity report.
- Add tax report.

## User Experience

- Add a dedicated admin user-management screen.
- Add table layout grid snapping.
- Add conflict warning when tables overlap.
- Add better mobile/tablet layout testing.
- Add keyboard shortcuts for staff workflows.

## Testing

- Add backend unit tests for order, cart, and table services.
- Add frontend component tests.
- Add end-to-end tests for each role.
- Add regression tests for checkout, delete order, close order, and customer table restriction.

## Summary

The current project is strong for a school assignment because it demonstrates:

- Full-stack development.
- Role-based access control.
- Real database relationships.
- Order and cart lifecycle.
- Kitchen workflow.
- Checkout workflow.
- Admin reporting.
- API documentation and workflow documentation.

The future improvements listed above explain how the project could grow into a more production-ready restaurant POS system.

