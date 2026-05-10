package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.CheckoutRequest;
import com.jie.restaurant_pos.dto.CloseOrderRequest;
import com.jie.restaurant_pos.dto.CreateOrderRequest;
import com.jie.restaurant_pos.dto.UpdateOrderCustomerRequest;
import com.jie.restaurant_pos.dto.UpdateOrderRequest;
import com.jie.restaurant_pos.entity.Customer;
import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.enums.*;
import com.jie.restaurant_pos.repository.CartItemNoteRepository;
import com.jie.restaurant_pos.repository.CartItemRepository;
import com.jie.restaurant_pos.repository.CustomerRepository;
import com.jie.restaurant_pos.repository.OrderRepository;
import com.jie.restaurant_pos.repository.RestaurantTableRepository;
import com.jie.restaurant_pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository tableRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final CartItemRepository cartItemRepository;
    private final CartItemNoteRepository cartItemNoteRepository;

    @Value("${app.order-close-code:4900}")
    private String orderCloseCode;

    public List<Order> getOrders(LocalDate date, OrderStatus status, OrderType type) {
        if (date == null) {
            if (status != null && type != null) {
                return sortOrders(orderRepository.findByOrderStatusAndOrderType(status, type));
            }

            if (status != null) {
                return sortOrders(orderRepository.findByOrderStatus(status));
            }

            if (type != null) {
                return sortOrders(orderRepository.findByOrderType(type));
            }

            return sortOrders(orderRepository.findAll());
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        if (status != null && type != null) {
            return sortOrders(
                    orderRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndOrderStatusAndOrderType(
                            start, end, status, type
                    )
            );
        }

        if (status != null) {
            return sortOrders(
                    orderRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndOrderStatus(
                            start, end, status
                    )
            );
        }

        if (type != null) {
            return sortOrders(
                    orderRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndOrderType(
                            start, end, type
                    )
            );
        }

        return sortOrders(orderRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, end));
    }

    private List<Order> sortOrders(List<Order> orders) {
        return orders.stream()
                .sorted(
                        Comparator.comparing((Order order) ->
                                        order.getOrderStatus() == OrderStatus.SERVING ? 0 : 1
                                )
                                .thenComparing(
                                        Order::getCreatedAt,
                                        Comparator.nullsLast(Comparator.reverseOrder())
                                )
                                .thenComparing(
                                        Order::getId,
                                        Comparator.nullsLast(Comparator.reverseOrder())
                                )
                )
                .toList();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order getCurrentOrderByTableId(Long tableId) {
        return orderRepository.findByTableIdAndOrderStatusOrderByIdDesc(tableId, OrderStatus.SERVING)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No current order for this table"));
    }

    public Order openTableOrder(Long tableId, Long userId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.CUSTOMER) {
            Long assignedTableId = user.getTable() == null ? null : user.getTable().getId();

            if (!tableId.equals(assignedTableId)) {
                throw new RuntimeException("Customer account is not assigned to this table");
            }
        }

        List<Order> activeOrders = orderRepository.findByTableIdAndOrderStatusOrderByIdDesc(
                tableId,
                OrderStatus.SERVING
        );

        if (!activeOrders.isEmpty()) {
            if (table.getTableStatus() != TableStatus.OCCUPIED) {
                table.setTableStatus(TableStatus.OCCUPIED);
                tableRepository.save(table);
            }

            Order activeOrder = activeOrders.get(0);
            activeOrder.setHandlerNameSnapshot(user.getUsername());
            activeOrder.setTableNameSnapshot(table.getLabel());
            activeOrder.setUpdatedAt(LocalDateTime.now());

            return orderRepository.save(activeOrder);
        }

        if (table.getTableStatus() == TableStatus.OCCUPIED) {
            throw new RuntimeException("No current order for occupied table");
        }

        Order order = new Order();

        order.setTable(table);
        order.setTableNameSnapshot(table.getLabel());
        order.setUsernameSnapshot(user.getUsername());
        order.setHandlerNameSnapshot(user.getUsername());

        order.setOrderType(OrderType.DINING);
        order.setOrderStatus(OrderStatus.SERVING);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setTransactionMethod(TransactionMethod.NONE);
        order.setCardType(CardType.NONE);

        order.setSubtotal(BigDecimal.ZERO);
        order.setTips(BigDecimal.ZERO);
        order.setTax(BigDecimal.ZERO);
        order.setTotal(BigDecimal.ZERO);

        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        table.setTableStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        return orderRepository.save(order);
    }

    public Order createOrder(CreateOrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();

        order.setUsernameSnapshot(user.getUsername());
        order.setHandlerNameSnapshot(user.getUsername());

        order.setOrderType(request.getOrderType());
        order.setOrderStatus(OrderStatus.SERVING);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setTransactionMethod(TransactionMethod.NONE);
        order.setCardType(CardType.NONE);

        order.setSubtotal(BigDecimal.ZERO);
        order.setTips(BigDecimal.ZERO);
        order.setTax(BigDecimal.ZERO);
        order.setTotal(BigDecimal.ZERO);

        if (request.getTableId() != null) {
            RestaurantTable table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));

            if (table.getTableStatus() == TableStatus.OCCUPIED) {
                throw new RuntimeException("Table is already occupied");
            }

            table.setTableStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);

            order.setTable(table);
            order.setTableNameSnapshot(table.getLabel());
            order.setOrderType(OrderType.DINING);
        }

        if (request.getCustomer() != null) {
            Customer customer = new Customer();
            customer.setName(request.getCustomer().getName());
            customer.setAddress(request.getCustomer().getAddress());
            customer.setPhoneNumber(request.getCustomer().getPhoneNumber());
            customer.setNote(request.getCustomer().getNote());

            order.setCustomer(customerRepository.save(customer));
        }

        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public Order updateOrder(Long id, UpdateOrderRequest request) {
        Order order = getOrderById(id);

        if (request.getOrderType() != null) {
            order.setOrderType(request.getOrderType());

            if (request.getOrderType() != OrderType.DINING && order.getTable() != null) {
                RestaurantTable table = order.getTable();
                table.setTableStatus(TableStatus.AVAILABLE);
                tableRepository.save(table);
                order.setTable(null);
            }
        }

        if (request.getOrderStatus() != null) {
            order.setOrderStatus(request.getOrderStatus());
        }

        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }

        if (request.getTransactionMethod() != null) {
            order.setTransactionMethod(request.getTransactionMethod());
        }

        if (request.getCardType() != null) {
            order.setCardType(request.getCardType());
        }

        if (request.getSubtotal() != null) {
            order.setSubtotal(request.getSubtotal());
        }

        if (request.getTips() != null) {
            order.setTips(request.getTips());
        }

        if (request.getTax() != null) {
            order.setTax(request.getTax());
        }

        if (request.getTotal() != null) {
            order.setTotal(request.getTotal());
        }

        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public Order updateOrderCustomer(Long id, UpdateOrderCustomerRequest request) {
        Order order = getOrderById(id);

        Customer customer = order.getCustomer();

        if (customer == null) {
            customer = new Customer();
        }

        customer.setName(request.getName());
        customer.setAddress(request.getAddress());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setNote(request.getNote());

        Customer savedCustomer = customerRepository.save(customer);

        order.setCustomer(savedCustomer);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public Order moveOrderToTable(Long orderId, Long newTableId) {
        Order order = getOrderById(orderId);

        RestaurantTable newTable = tableRepository.findById(newTableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        if (newTable.getTableStatus() == TableStatus.OCCUPIED) {
            throw new RuntimeException("Cannot move order to occupied table");
        }

        if (order.getTable() != null) {
            RestaurantTable oldTable = order.getTable();
            oldTable.setTableStatus(TableStatus.AVAILABLE);
            tableRepository.save(oldTable);
        }

        newTable.setTableStatus(TableStatus.OCCUPIED);
        tableRepository.save(newTable);

        order.setTable(newTable);
        order.setTableNameSnapshot(newTable.getLabel());
        order.setOrderType(OrderType.DINING);
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    public Order checkoutOrder(Long id, CheckoutRequest request) {
        Order order = getOrderById(id);

        order.setOrderStatus(OrderStatus.COMPLETED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setTransactionMethod(request.getTransactionMethod());
        order.setCardType(request.getCardType());
        order.setTips(request.getTips());
        order.setSubtotal(request.getSubtotal());
        order.setTax(request.getTax());
        order.setTotal(request.getTotal());
        order.setUpdatedAt(LocalDateTime.now());

        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setTableStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = getOrderById(id);

        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setTableStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        orderRepository.delete(order);
    }

    public void closeTableOrder(Long tableId, CloseOrderRequest request) {
        String submittedCode = request == null ? null : request.getCode();

        if (submittedCode == null || !submittedCode.equals(orderCloseCode)) {
            throw new RuntimeException("Invalid close code");
        }

        Order order = orderRepository.findByTableIdAndOrderStatusOrderByIdDesc(tableId, OrderStatus.SERVING)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No current order for this table"));

        deleteOrder(order.getId());
    }

    public Order recalculateOrderTotal(Long orderId) {
        Order order = getOrderById(orderId);

        BigDecimal subtotal = cartItemRepository.findByOrderId(orderId).stream()
                .map(item -> {
                    BigDecimal notesTotal = cartItemNoteRepository.sumPriceByCartItemId(item.getId());
                    BigDecimal itemPrice = item.getPriceSnapshot() != null ? item.getPriceSnapshot() : BigDecimal.ZERO;
                    int quantity = item.getQuantity() != null ? item.getQuantity() : 0;

                    return itemPrice
                            .add(notesTotal)
                            .multiply(BigDecimal.valueOf(quantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.10"));
        BigDecimal tips = order.getTips() != null ? order.getTips() : BigDecimal.ZERO;

        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setTotal(subtotal.add(tax).add(tips));
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }
}
