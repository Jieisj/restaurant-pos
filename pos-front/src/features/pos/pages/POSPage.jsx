import { useEffect, useMemo, useRef, useState } from "react";
import { ROLES } from "../../../constants/roles";
import MenuPage from "../../menu/pages/MenuPage";
import CartSection from "../components/CartSection";
import TablesSection from "../components/TablesSection";
import TableLayoutSection from "../components/TableLayoutSection";
import KitchenSection from "../components/KitchenSection";
import OrderSection from "../components/OrderSection";
import ReportSection from "../components/ReportSection";

const mockUser = {
  id: 1,
  name: "Alex Waiter",
  role: ROLES.WAITER,
};

const initialTables = [
  { id: 1, name: "Table 1", seats: 4, status: "occupied", x: 40, y: 40 },
  { id: 2, name: "Table 2", seats: 2, status: "occupied", x: 220, y: 60 },
  { id: 3, name: "Table 3", seats: 6, status: "reserved", x: 120, y: 180 },
];

const TAX_RATE = 0.1;
const NOTE_WORD_LIMIT = 15;

function roundToTwo(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function clampNoteWords(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/).slice(0, NOTE_WORD_LIMIT).join(" ");
}

function calculateOrderFinancials(dishes = [], taxRate = TAX_RATE) {
  const itemsCount = dishes.reduce((sum, dish) => sum + (dish.quantity || 0), 0);
  const subtotal = roundToTwo(
    dishes.reduce(
      (sum, dish) => sum + (Number(dish.price) || 0) * (dish.quantity || 0),
      0
    )
  );
  const tax = roundToTwo(subtotal * taxRate);
  const total = roundToTwo(subtotal + tax);

  return {
    itemsCount,
    subtotal,
    tax,
    total,
  };
}

function hydrateOrder(order) {
  const summary = calculateOrderFinancials(order?.dishes || []);

  return {
    ...order,
    customerName: order?.customerName || "",
    phoneNumber: order?.phoneNumber || "",
    address: order?.address || "",
    note: clampNoteWords(order?.note || ""),
    payment: order?.payment || "unpaid",
    cardType:
      (order?.payment || "unpaid") === "card"
        ? order?.cardType || "visa"
        : "none",
    tips: roundToTwo(order?.tips || 0),
    subtotal: summary.subtotal,
    tax: summary.tax,
    total: summary.total,
    itemsCount: summary.itemsCount,
  };
}


function getNowParts() {
  const now = new Date();

  return {
    now,
    iso: now.toISOString(),
    date: now.toISOString().slice(0, 10),
    time: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function createDishTimestampFields(overrides = {}) {
  const { iso, date, time } = getNowParts();

  return {
    addedAt: overrides.addedAt ?? iso,
    addedDate: overrides.addedDate ?? date,
    addedTime: overrides.addedTime ?? time,
    sentAt: overrides.sentAt ?? null,
    sentDate: overrides.sentDate ?? null,
    sentTime: overrides.sentTime ?? null,
  };
}

function POSPage() {
  const role = mockUser.role;

  const isAdmin = role === ROLES.ADMIN;
  const isWaiter = role === ROLES.WAITER;
  const isCashier = role === ROLES.CASHIER;
  const isKitchen = role === ROLES.KITCHEN;
  const isCustomer = role === ROLES.CUSTOMER;

  const isWaiterLike = isWaiter || isCashier;

  const defaultSection = useMemo(() => {
    if (isAdmin) return "table-layout";
    if (isKitchen) return "kitchen";
    if (isWaiterLike) return "tables";
    if (isCustomer) return "menu";
    return "menu";
  }, [isAdmin, isKitchen, isWaiterLike, isCustomer]);

  const [activeSection, setActiveSection] = useState(defaultSection);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [tables, setTables] = useState(initialTables);

  const [serviceMode, setServiceMode] = useState("dining");
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState(null);
  const [queuedDiningItem, setQueuedDiningItem] = useState(null);
  const [pendingDiningSwitchOrderId, setPendingDiningSwitchOrderId] =
    useState(null);
  const [reopenOrderDetailsId, setReopenOrderDetailsId] = useState(null);
  const [diningAssignmentSource, setDiningAssignmentSource] = useState(null);

  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const showNotification = (message, type = "success", duration = 1800) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    setNotification({
      id: Date.now(),
      message,
      type,
    });

    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, duration);
  };

  const [orders, setOrders] = useState(() => {
    const base = getNowParts();

    return [
      {
        id: 1,
        date: base.date,
        time: "12:10",
        orderNumber: "#1001",
        type: "dining",
        tableId: 1,
        tableName: "Table 1",
        status: "serving",
        waiterName: mockUser.name,
        userName: mockUser.name,
        itemsCount: 3,
        total: 22.48,
        dishes: [
          {
            id: 101,
            name: "Cheese Burger",
            price: 9.99,
            quantity: 2,
            comment: "",
            isPending: false,
            modifiers: {
              addOptions: ["Cheese", "Bacon"],
              noOptions: ["Onion", "Pickles"],
              switchPairs: [{ from: "Fries", to: "Salad" }],
            },
            selectedModifiers: {
              add: ["Cheese"],
              no: [],
              switchPair: { from: "Fries", to: "Salad" },
            },
            addedAt: `${base.date}T12:10:00`,
            addedDate: base.date,
            addedTime: "12:10",
            sentAt: `${base.date}T12:10:00`,
            sentDate: base.date,
            sentTime: "12:10",
          },
          {
            id: 102,
            name: "Coca Cola",
            price: 2.5,
            quantity: 1,
            comment: "",
            isPending: false,
            modifiers: {
              addOptions: ["Ice"],
              noOptions: ["Sugar"],
              switchPairs: [{ from: "Medium", to: "Large" }],
            },
            selectedModifiers: {
              add: ["Ice"],
              no: ["Sugar"],
              switchPair: { from: "Medium", to: "Large" },
            },
            addedAt: `${base.date}T12:10:00`,
            addedDate: base.date,
            addedTime: "12:10",
            sentAt: `${base.date}T12:10:00`,
            sentDate: base.date,
            sentTime: "12:10",
          },
        ],
      },
      {
        id: 2,
        date: base.date,
        time: "12:20",
        orderNumber: "#1002",
        type: "dining",
        tableId: 2,
        tableName: "Table 2",
        status: "serving",
        waiterName: mockUser.name,
        userName: mockUser.name,
        itemsCount: 2,
        total: 15.74,
        dishes: [
          {
            id: 201,
            name: "Chicken Burger",
            price: 10.99,
            quantity: 1,
            comment: "",
            isPending: false,
            modifiers: {
              addOptions: ["Egg"],
              noOptions: ["Tomato"],
              switchPairs: [{ from: "Fries", to: "Coleslaw" }],
            },
            selectedModifiers: {
              add: [],
              no: [],
              switchPair: null,
            },
            addedAt: `${base.date}T12:20:00`,
            addedDate: base.date,
            addedTime: "12:20",
            sentAt: `${base.date}T12:20:00`,
            sentDate: base.date,
            sentTime: "12:20",
          },
          {
            id: 202,
            name: "Chocolate Cake",
            price: 4.75,
            quantity: 1,
            comment: "",
            isPending: false,
            modifiers: {
              addOptions: ["Ice Cream"],
              noOptions: [],
              switchPairs: [],
            },
            selectedModifiers: {
              add: ["Ice Cream"],
              no: [],
              switchPair: null,
            },
            addedAt: `${base.date}T12:20:00`,
            addedDate: base.date,
            addedTime: "12:20",
            sentAt: `${base.date}T12:20:00`,
            sentDate: base.date,
            sentTime: "12:20",
          },
        ],
      },
      {
        id: 3,
        date: base.date,
        time: "12:35",
        orderNumber: "#1003",
        type: "to-go",
        tableId: null,
        tableName: null,
        customerName: "Guest",
        phoneNumber: "",
        address: "",
        note: "",
        status: "completed",
        waiterName: mockUser.name,
        userName: mockUser.name,
        itemsCount: 1,
        total: 7.25,
        dishes: [
          {
            id: 301,
            name: "Coca Cola",
            price: 7.25,
            quantity: 1,
            comment: "",
            isPending: false,
            modifiers: {
              addOptions: ["Ice"],
              noOptions: ["Sugar"],
              switchPairs: [{ from: "Medium", to: "Large" }],
            },
            selectedModifiers: {
              add: [],
              no: [],
              switchPair: null,
            },
            addedAt: `${base.date}T12:35:00`,
            addedDate: base.date,
            addedTime: "12:35",
            sentAt: `${base.date}T12:35:00`,
            sentDate: base.date,
            sentTime: "12:35",
          },
        ],
      },
    ];
  });

  const effectiveOrders = useMemo(
    () => orders.map((order) => hydrateOrder(order)),
    [orders]
  );

  const allowedSections = useMemo(() => {
    if (isAdmin) {
      return ["table-layout", "tables", "cart", "menu", "order", "report"];
    }
    if (isKitchen) {
      return ["kitchen"];
    }
    if (isWaiterLike) {
      return ["tables", "cart", "menu", "order", "report"];
    }
    if (isCustomer) {
      return ["menu", "cart"];
    }
    return ["menu", "cart"];
  }, [isAdmin, isKitchen, isWaiterLike, isCustomer]);

  const currentSection = allowedSections.includes(activeSection)
    ? activeSection
    : defaultSection;

  const getCurrentDateTime = () => {
    const { date, time } = getNowParts();
    return { date, time };
  };

  const createOrderNumber = (orderList = orders) => {
    const numbers = orderList
      .map((order) => Number(String(order.orderNumber || "").replace("#", "")))
      .filter((value) => !Number.isNaN(value));

    const max = numbers.length ? Math.max(...numbers) : 1000;
    return `#${max + 1}`;
  };

  const getItemIdentity = (item) => {
    const modifiers = item.selectedModifiers || {};
    const add = modifiers.add || [];
    const no = modifiers.no || [];
    const switchPair = modifiers.switchPair || null;

    return JSON.stringify({
      id: item.id,
      add,
      no,
      switchPair,
    });
  };

  const normalizeItemForOrder = (item, overrides = {}) => {
    const timestampFields = createDishTimestampFields({
      addedAt: overrides.addedAt,
      addedDate: overrides.addedDate,
      addedTime: overrides.addedTime,
      sentAt: overrides.sentAt,
      sentDate: overrides.sentDate,
      sentTime: overrides.sentTime,
    });

    return {
      id: overrides.id ?? Date.now() + Math.floor(Math.random() * 1000),
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      comment: item.comment || "",
      isPending: overrides.isPending ?? true,
      modifiers: item.modifiers || {
        addOptions: [],
        noOptions: [],
        switchPairs: [],
      },
      selectedModifiers: item.selectedModifiers || {
        add: [],
        no: [],
        switchPair: null,
      },
      ...timestampFields,
    };
  };

  const calculateOrderSummary = (dishes = []) =>
    calculateOrderFinancials(dishes);

  const activeDiningOrder = useMemo(() => {
    if (!selectedTableId) return null;

    return (
      effectiveOrders.find(
        (order) =>
          order.type === "dining" &&
          order.tableId === selectedTableId &&
          order.status === "serving"
      ) || null
    );
  }, [effectiveOrders, selectedTableId]);

  const activeCustomerOrder = useMemo(() => {
    if (!activeCustomerOrderId) return null;

    return effectiveOrders.find((order) => order.id === activeCustomerOrderId) || null;
  }, [effectiveOrders, activeCustomerOrderId]);

  const activeOrder = selectedTableId ? activeDiningOrder : activeCustomerOrder;

  const activeOrderState = useMemo(() => {
    if (!activeOrder) {
      return {
        current: [],
        pending: [],
      };
    }

    return {
      current: (activeOrder.dishes || []).filter((dish) => !dish.isPending),
      pending: (activeOrder.dishes || []).filter((dish) => dish.isPending),
    };
  }, [activeOrder]);

  const displayTables = useMemo(() => {
    return tables;
  }, [tables]);

  const selectedTable =
    displayTables.find((table) => table.id === selectedTableId) || null;

  const unavailableDiningTableIds = useMemo(() => {
    return effectiveOrders
      .filter((order) => {
        if (order.type !== "dining") return false;
        if (order.status !== "serving") return false;
        if (!order.tableId) return false;
        if (
          pendingDiningSwitchOrderId &&
          pendingDiningSwitchOrderId !== "new-dining" &&
          order.id === pendingDiningSwitchOrderId
        ) {
          return false;
        }
        return true;
      })
      .map((order) => order.tableId);
  }, [effectiveOrders, pendingDiningSwitchOrderId]);

  const isDiningAssignmentMode =
    Boolean(queuedDiningItem) || Boolean(pendingDiningSwitchOrderId);

  const navigateToSection = (section) => {
    if (section !== "tables") {
      const orderIdToReopen =
        typeof pendingDiningSwitchOrderId === "number"
          ? pendingDiningSwitchOrderId
          : null;

      setPendingDiningSwitchOrderId(null);
      setQueuedDiningItem(null);

      if (orderIdToReopen) {
        setReopenOrderDetailsId(orderIdToReopen);
      }
    }

    setActiveSection(section);
  };

  const ensureDiningOrderForTable = (tableId) => {
    const existingOrder = orders.find(
      (order) =>
        order.type === "dining" &&
        order.tableId === tableId &&
        order.status === "serving"
    );

    if (existingOrder) {
      return existingOrder.id;
    }

    const table = displayTables.find((entry) => entry.id === tableId);
    if (!table) return null;

    const { date, time } = getCurrentDateTime();
    const newOrder = {
      id: Date.now(),
      date,
      time,
      orderNumber: createOrderNumber(),
      type: "dining",
      tableId,
      tableName: table.name,
      customerName: "",
      phoneNumber: "",
      address: "",
      note: "",
      status: "serving",
      waiterName: mockUser.name,
      userName: mockUser.name,
      itemsCount: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      payment: "unpaid",
      tips: 0,
      dishes: [],
    };

    setOrders((prev) => [hydrateOrder(newOrder), ...prev]);
    setTables((prevTables) =>
      prevTables.map((entry) =>
        entry.id === tableId
          ? {
              ...entry,
              status: "occupied",
            }
          : entry
      )
    );
    return newOrder.id;
  };

  const updateOrderDishes = (orderId, updater) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        const nextDishes =
          typeof updater === "function" ? updater(order.dishes || []) : updater;

        const summary = calculateOrderSummary(nextDishes);
        const { date, time } = getCurrentDateTime();

        return hydrateOrder({
          ...order,
          date,
          time,
          dishes: nextDishes,
          itemsCount: summary.itemsCount,
          subtotal: summary.subtotal,
          tax: summary.tax,
          total: summary.total,
          status:
            order.status === "completed" && nextDishes.length > 0
              ? "serving"
              : order.status,
        });
      })
    );
  };

  const addItemToOrder = (orderId, item) => {
    updateOrderDishes(orderId, (prevDishes) => {
      const normalizedItem = normalizeItemForOrder(item, {
        isPending: true,
      });

      const identity = getItemIdentity(normalizedItem);
      const existingIndex = prevDishes.findIndex(
        (dish) => dish.isPending && getItemIdentity(dish) === identity
      );

      if (existingIndex === -1) {
        return [...prevDishes, normalizedItem];
      }

      return prevDishes.map((dish, index) =>
        index === existingIndex
          ? {
              ...dish,
              quantity: (dish.quantity || 0) + (normalizedItem.quantity || 1),
              addedAt: normalizedItem.addedAt,
              addedDate: normalizedItem.addedDate,
              addedTime: normalizedItem.addedTime,
            }
          : dish
      );
    });
  };

  const handleCreateCustomerOrder = (customerInfo) => {
    const nextType = customerInfo.orderType;
    const { date, time } = getCurrentDateTime();
    const orderId = Date.now();

    const newOrder = {
      id: orderId,
      date,
      time,
      orderNumber: createOrderNumber(),
      type: nextType,
      tableId: null,
      tableName: null,
      customerName: customerInfo.customerName || "",
      phoneNumber: customerInfo.phoneNumber || "",
      address: customerInfo.address || "",
      note: customerInfo.note || "",
      status: "serving",
      waiterName: mockUser.name,
      userName: mockUser.name,
      itemsCount: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      payment: "unpaid",
      tips: 0,
      dishes: [],
    };

    setOrders((prev) => [hydrateOrder({
      ...newOrder,
      note: clampNoteWords(newOrder.note),
    }), ...prev]);
    setActiveCustomerOrderId(orderId);
    setSelectedTableId(null);
    setServiceMode(nextType);
    setPendingDiningSwitchOrderId(null);
    setQueuedDiningItem(null);
  };

  const handleCreateCustomerOrderAndAddItem = (customerInfo, item) => {
    const nextType = customerInfo.orderType;
    const { date, time } = getCurrentDateTime();
    const orderId = Date.now();

    const newOrder = {
      id: orderId,
      date,
      time,
      orderNumber: createOrderNumber(),
      type: nextType,
      tableId: null,
      tableName: null,
      customerName: customerInfo.customerName || "",
      phoneNumber: customerInfo.phoneNumber || "",
      address: customerInfo.address || "",
      note: customerInfo.note || "",
      status: "serving",
      waiterName: mockUser.name,
      userName: mockUser.name,
      itemsCount: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      payment: "unpaid",
      tips: 0,
      dishes: [normalizeItemForOrder(item, { isPending: true })],
    };

    const summary = calculateOrderSummary(newOrder.dishes);
    newOrder.itemsCount = summary.itemsCount;
    newOrder.subtotal = summary.subtotal;
    newOrder.tax = summary.tax;
    newOrder.total = summary.total;

    setOrders((prev) => [hydrateOrder({
      ...newOrder,
      note: clampNoteWords(newOrder.note),
    }), ...prev]);
    setActiveCustomerOrderId(orderId);
    setSelectedTableId(null);
    setServiceMode(nextType);
    setPendingDiningSwitchOrderId(null);
    setQueuedDiningItem(null);
    setActiveSection("cart");
  };

  const handleOpenTable = (tableId) => {
    const table = displayTables.find((entry) => entry.id === tableId);
    const isBlockedForDiningAssignment =
      isDiningAssignmentMode && unavailableDiningTableIds.includes(tableId);

    if (isBlockedForDiningAssignment) return;

    if (pendingDiningSwitchOrderId) {
      let targetOrderId = null;

      if (pendingDiningSwitchOrderId === "new-dining") {
        targetOrderId = ensureDiningOrderForTable(tableId);
      } else {
        targetOrderId = pendingDiningSwitchOrderId;

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === pendingDiningSwitchOrderId
              ? {
                  ...order,
                  type: "dining",
                  tableId,
                  tableName: table?.name || `Table ${tableId}`,
                  customerName: "",
                  phoneNumber: "",
                  address: "",
                  note: "",
                  status: "serving",
                }
              : order
          )
        );
      }

      setTables((prevTables) =>
        prevTables.map((entry) =>
          entry.id === tableId
            ? {
                ...entry,
                status: "occupied",
              }
            : entry
        )
      );

      setTables((prevTables) =>
        prevTables.map((entry) =>
          entry.id === tableId
            ? {
                ...entry,
                status: "occupied",
              }
            : entry
        )
      );

      setSelectedTableId(tableId);
      setActiveCustomerOrderId(null);
      setServiceMode("dining");
      setPendingDiningSwitchOrderId(null);
      setDiningAssignmentSource(null);

      if (queuedDiningItem && targetOrderId) {
        addItemToOrder(targetOrderId, queuedDiningItem);
        setQueuedDiningItem(null);
      }

      setActiveSection("menu");
      return;
    }

    const ensuredOrderId = ensureDiningOrderForTable(tableId);

    setSelectedTableId(tableId);
    setActiveCustomerOrderId(null);
    setServiceMode("dining");

    if (queuedDiningItem && ensuredOrderId) {
      addItemToOrder(ensuredOrderId, queuedDiningItem);
      setQueuedDiningItem(null);
    }

    setActiveSection("menu");
  };

  const handleCancelAssignDining = () => {
    const shouldReopenOrderDetails =
      diningAssignmentSource === "order-details" &&
      typeof pendingDiningSwitchOrderId === "number";

    const orderIdToReopen = shouldReopenOrderDetails
      ? pendingDiningSwitchOrderId
      : null;

    setPendingDiningSwitchOrderId(null);
    setDiningAssignmentSource(null);
    setQueuedDiningItem(null);
    setSelectedTableId(null);

    if (orderIdToReopen) {
      setReopenOrderDetailsId(orderIdToReopen);
      setActiveSection("order");
      return;
    }

    setActiveSection("menu");
  };

  const handleStartDiningSelection = (item) => {
    setQueuedDiningItem(item);
    setServiceMode("dining");
    setActiveCustomerOrderId(null);
    setSelectedTableId(null);
    setPendingDiningSwitchOrderId(null);
    setDiningAssignmentSource(null);
    setActiveSection("tables");
  };

  const handleChangeActiveOrderType = (nextType) => {
    if (!nextType) return;

    if (nextType === "dining") {
      if (selectedTableId) {
        setServiceMode("dining");
        setActiveCustomerOrderId(null);
        setPendingDiningSwitchOrderId(null);
        setDiningAssignmentSource(null);
        setQueuedDiningItem(null);
        setActiveSection("tables");
        return;
      }

      if (activeCustomerOrderId) {
        setPendingDiningSwitchOrderId(activeCustomerOrderId);
        setDiningAssignmentSource("service-panel");
        setQueuedDiningItem(null);
        setSelectedTableId(null);
        setActiveSection("tables");
        return;
      }

      setServiceMode("dining");
      setActiveCustomerOrderId(null);
      setPendingDiningSwitchOrderId("new-dining");
      setDiningAssignmentSource("service-panel");
      setQueuedDiningItem(null);
      setSelectedTableId(null);
      setActiveSection("tables");
      return;
    }

    if (selectedTableId && activeDiningOrder) {
      const tableIdToRelease = selectedTableId;
      const targetOrderId = activeDiningOrder.id;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === targetOrderId
            ? {
                ...order,
                type: nextType,
                tableId: null,
                tableName: null,
              }
            : order
        )
      );

      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === tableIdToRelease
            ? {
                ...table,
                status: "available",
              }
            : table
        )
      );

      setActiveCustomerOrderId(targetOrderId);
      setSelectedTableId(null);
      setServiceMode(nextType);
      setPendingDiningSwitchOrderId(null);
      setDiningAssignmentSource(null);
      setQueuedDiningItem(null);
      return;
    }

    if (activeCustomerOrderId) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === activeCustomerOrderId
            ? {
                ...order,
                type: nextType,
              }
            : order
        )
      );

      setServiceMode(nextType);
      setPendingDiningSwitchOrderId(null);
      setDiningAssignmentSource(null);
      setQueuedDiningItem(null);
    }
  };

  const handleSaveTableLayout = (nextTables) => {
    const deletedTableIds = tables
      .filter((table) => !nextTables.some((nextTable) => nextTable.id === table.id))
      .map((table) => table.id);

    const nonOccupiedTableIds = nextTables
      .filter((table) => table.status !== "occupied")
      .map((table) => table.id);

    const orderIdsToRemove = new Set(
      orders
        .filter(
          (order) =>
            order.type === "dining" &&
            order.tableId !== null &&
            (deletedTableIds.includes(order.tableId) ||
              nonOccupiedTableIds.includes(order.tableId))
        )
        .map((order) => order.id)
    );

    const selectedTableWillBeCleared =
      selectedTableId !== null &&
      (deletedTableIds.includes(selectedTableId) ||
        nonOccupiedTableIds.includes(selectedTableId));

    setTables(nextTables);

    if (orderIdsToRemove.size > 0) {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => !orderIdsToRemove.has(order.id))
      );

      if (selectedTableWillBeCleared) {
        setSelectedTableId(null);
      }

      if (activeCustomerOrderId && orderIdsToRemove.has(activeCustomerOrderId)) {
        setActiveCustomerOrderId(null);
      }

      if (
        pendingDiningSwitchOrderId &&
        pendingDiningSwitchOrderId !== "new-dining" &&
        orderIdsToRemove.has(pendingDiningSwitchOrderId)
      ) {
        setPendingDiningSwitchOrderId(null);
        setQueuedDiningItem(null);
      }

      if (reopenOrderDetailsId && orderIdsToRemove.has(reopenOrderDetailsId)) {
        setReopenOrderDetailsId(null);
      }
    }
  };


  const handleAddItemToPending = (item) => {
    if (selectedTableId) {
      const targetOrderId =
        activeDiningOrder?.id || ensureDiningOrderForTable(selectedTableId);

      if (targetOrderId) {
        addItemToOrder(targetOrderId, item);
        showNotification(`${item?.name || "Item"} added to order.`, "success");
      } else {
        showNotification("Could not add item to order.", "error");
      }
      return;
    }

    if (serviceMode !== "dining" && activeCustomerOrderId) {
      addItemToOrder(activeCustomerOrderId, item);
      showNotification(`${item?.name || "Item"} added to order.`, "success");
      return;
    }

    showNotification("Please open or create an order first.", "error");
  };

  const handleAddCurrentItemToPending = (item) => {
    handleAddItemToPending({
      ...item,
      quantity: 1,
    });
  };

  const handleIncreasePending = (itemToIncrease) => {
    if (!activeOrder) return;

    updateOrderDishes(activeOrder.id, (prevDishes) => {
      const identity = getItemIdentity(itemToIncrease);
      const { iso, date, time } = getNowParts();

      return prevDishes.map((dish) =>
        dish.isPending && getItemIdentity(dish) === identity
          ? {
              ...dish,
              quantity: (dish.quantity || 0) + 1,
              addedAt: iso,
              addedDate: date,
              addedTime: time,
            }
          : dish
      );
    });
  };

  const handleDecreasePending = (itemToDecrease) => {
    if (!activeOrder) return;

    updateOrderDishes(activeOrder.id, (prevDishes) => {
      const identity = getItemIdentity(itemToDecrease);

      return prevDishes
        .map((dish) =>
          dish.isPending && getItemIdentity(dish) === identity
            ? { ...dish, quantity: (dish.quantity || 0) - 1 }
            : dish
        )
        .filter((dish) => dish.quantity > 0);
    });
  };

  const handleRemovePending = (itemToRemove) => {
    if (!activeOrder) return;

    updateOrderDishes(activeOrder.id, (prevDishes) => {
      const identity = getItemIdentity(itemToRemove);

      return prevDishes.filter(
        (dish) => !(dish.isPending && getItemIdentity(dish) === identity)
      );
    });
  };

  const handleSendPending = () => {
    if (!activeOrder) {
      showNotification("No active order selected.", "error");
      return;
    }

    if (activeOrderState.pending.length === 0) {
      showNotification("There are no pending items to send.", "error");
      return;
    }

    updateOrderDishes(activeOrder.id, (prevDishes) => {
      const sentItems = prevDishes.filter((dish) => !dish.isPending);
      const pendingItems = prevDishes.filter((dish) => dish.isPending);
      const sentStamp = getNowParts();

      let mergedCurrent = [...sentItems];

      pendingItems.forEach((pendingItem) => {
        const identity = getItemIdentity(pendingItem);
        const existingIndex = mergedCurrent.findIndex(
          (currentItem) => getItemIdentity(currentItem) === identity
        );

        if (existingIndex === -1) {
          mergedCurrent.push({
            ...pendingItem,
            isPending: false,
            sentAt: sentStamp.iso,
            sentDate: sentStamp.date,
            sentTime: sentStamp.time,
          });
          return;
        }

        mergedCurrent = mergedCurrent.map((currentItem, index) =>
          index === existingIndex
            ? {
                ...currentItem,
                quantity:
                  (currentItem.quantity || 0) + (pendingItem.quantity || 0),
                sentAt: sentStamp.iso,
                sentDate: sentStamp.date,
                sentTime: sentStamp.time,
              }
            : currentItem
        );
      });

      return mergedCurrent.map((dish) => ({
        ...dish,
        isPending: false,
      }));
    });

    showNotification("Pending items sent successfully.", "success");
  };

  const handleSaveOrder = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== updatedOrder.id) return order;

        const summary = calculateOrderSummary(updatedOrder.dishes || []);

        return hydrateOrder({
          ...updatedOrder,
          note: clampNoteWords(updatedOrder.note),
          itemsCount: summary.itemsCount,
          subtotal: summary.subtotal,
          tax: summary.tax,
          total: summary.total,
          cardType:
            (updatedOrder.payment || "unpaid") === "card"
              ? updatedOrder.cardType || "visa"
              : "none",
          tips: roundToTwo(updatedOrder.tips || 0),
        });
      })
    );

    if (updatedOrder.type === "dining") {
      setSelectedTableId(updatedOrder.tableId || null);
      if (updatedOrder.tableId) {
        setActiveCustomerOrderId(null);
        setServiceMode("dining");
      }
    } else if (activeOrder?.id === updatedOrder.id) {
      setSelectedTableId(null);
      setActiveCustomerOrderId(updatedOrder.id);
      setServiceMode(updatedOrder.type);
    }
  };

  const handleSendPendingForOrder = (orderId, pendingDishIds) => {
    if (!orderId) {
      showNotification("No order selected.", "error");
      return;
    }

    if (!Array.isArray(pendingDishIds) || pendingDishIds.length === 0) {
      showNotification("Please select pending items to send.", "error");
      return;
    }

    updateOrderDishes(orderId, (prevDishes) => {
      const sentStamp = getNowParts();

      const nextDishes = prevDishes.map((dish) =>
        pendingDishIds.includes(dish.id)
          ? {
              ...dish,
              isPending: false,
              sentAt: sentStamp.iso,
              sentDate: sentStamp.date,
              sentTime: sentStamp.time,
            }
          : dish
      );

      const sentItems = nextDishes.filter((dish) => !dish.isPending);
      const pendingItems = nextDishes.filter((dish) => dish.isPending);

      let mergedSent = [];

      sentItems.forEach((dish) => {
        const identity = getItemIdentity(dish);
        const existingIndex = mergedSent.findIndex(
          (currentItem) => getItemIdentity(currentItem) === identity
        );

        if (existingIndex === -1) {
          mergedSent.push(dish);
          return;
        }

        mergedSent = mergedSent.map((currentItem, index) =>
          index === existingIndex
            ? {
                ...currentItem,
                quantity: (currentItem.quantity || 0) + (dish.quantity || 0),
                sentAt: dish.sentAt || currentItem.sentAt || sentStamp.iso,
                sentDate:
                  dish.sentDate || currentItem.sentDate || sentStamp.date,
                sentTime:
                  dish.sentTime || currentItem.sentTime || sentStamp.time,
              }
            : currentItem
        );
      });

      return [...mergedSent, ...pendingItems];
    });

    showNotification("Selected items sent successfully.", "success");
  };

  const handleDeletePendingDishes = (orderId, pendingDishIds) => {
    updateOrderDishes(orderId, (prevDishes) =>
      prevDishes.filter((dish) => !pendingDishIds.includes(dish.id))
    );
  };

  const handleOpenOrderInMenu = (order) => {
    if (!order) return;

    if (order.type === "dining" && order.tableId) {
      setSelectedTableId(order.tableId);
      setActiveCustomerOrderId(null);
      setServiceMode("dining");
      setPendingDiningSwitchOrderId(null);
      setQueuedDiningItem(null);
      setActiveSection("menu");
      return;
    }

    setSelectedTableId(null);
    setActiveCustomerOrderId(order.id);
    setServiceMode(order.type || "to-go");
    setPendingDiningSwitchOrderId(null);
    setQueuedDiningItem(null);
    setActiveSection("menu");
  };

  const handleToggleDishFinished = (orderId, dishId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id !== orderId
          ? order
          : hydrateOrder({
              ...order,
              dishes: (order.dishes || []).map((dish) =>
                dish.id !== dishId
                  ? dish
                  : {
                      ...dish,
                      kitchenFinished: !dish.kitchenFinished,
                    }
              ),
            })
      )
    );
  };


  const handleCheckoutOrder = (orderId, checkoutPayload, orderSnapshot = null) => {
    if (!orderId) return;

    let completedOrder = null;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        const baseOrder =
          orderSnapshot && orderSnapshot.id === orderId
            ? {
                ...order,
                ...orderSnapshot,
                dishes: Array.isArray(orderSnapshot.dishes)
                  ? orderSnapshot.dishes
                  : order.dishes,
              }
            : order;

        const timestamp = getNowParts();
        const sentDishes = (baseOrder.dishes || []).map((dish) => ({
          ...dish,
          isPending: false,
          sentAt: dish.sentAt || timestamp.iso,
          sentDate: dish.sentDate || timestamp.date,
          sentTime: dish.sentTime || timestamp.time,
        }));

        completedOrder = hydrateOrder({
          ...baseOrder,
          dishes: sentDishes,
          payment: checkoutPayload?.payment || baseOrder.payment || "cash",
          cardType:
            (checkoutPayload?.payment || baseOrder.payment || "cash") === "card"
              ? checkoutPayload?.cardType || baseOrder.cardType || "visa"
              : "none",
          tips: roundToTwo(
            checkoutPayload?.tips !== undefined
              ? checkoutPayload.tips
              : baseOrder.tips || 0
          ),
          cashReceived: roundToTwo(checkoutPayload?.cashReceived || 0),
          cashChange: roundToTwo(checkoutPayload?.change || 0),
          status: "completed",
        });

        return completedOrder;
      })
    );

    if (completedOrder?.type === "dining" && completedOrder?.tableId) {
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === completedOrder.tableId
            ? { ...table, status: "available" }
            : table
        )
      );
    }

    if (selectedTableId === completedOrder?.tableId) {
      setSelectedTableId(null);
    }

    if (activeCustomerOrderId === orderId) {
      setActiveCustomerOrderId(null);
    }

    setReopenOrderDetailsId(null);
    setPendingDiningSwitchOrderId(null);
    setQueuedDiningItem(null);

    if (completedOrder?.type === "dining") {
      setServiceMode("dining");
      if (activeSection === "cart") {
        setActiveSection("tables");
      }
    }

    showNotification(
      `${completedOrder?.orderNumber || "Order"} checked out successfully.`,
      "success"
    );
  };

  const globalActiveOrder = activeOrder || null;

  const currentServiceLabel =
    globalActiveOrder?.type === "dining"
      ? globalActiveOrder.tableName ||
        (globalActiveOrder.tableId ? `Table ${globalActiveOrder.tableId}` : "Dining")
      : globalActiveOrder?.customerName ||
        globalActiveOrder?.orderNumber ||
        "Customer Order";

  const currentTypeValue =
    serviceMode === "to-go"
      ? "to-go"
      : serviceMode === "delivery"
      ? "delivery"
      : "dining";

  const showGlobalServicePanel = (isWaiterLike || isAdmin) && Boolean(globalActiveOrder);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerRow}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Restaurant POS</h1>
            <p style={styles.subtitle}>
              Manage table service, to-go, and delivery orders.
            </p>
            <p style={styles.userText}>User: {mockUser.name}</p>
          </div>

          {showGlobalServicePanel && (
            <div
              style={styles.servicePanel}
              onClick={() => navigateToSection("cart")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigateToSection("cart");
                }
              }}
              title="Open current order cart"
            >
              <div style={styles.serviceTextBlock}>
                <span style={styles.serviceLabel}>Now serving</span>
                <strong style={styles.serviceOrderNumber}>
                  {globalActiveOrder?.orderNumber || "No Order"}
                </strong>
                <span style={styles.serviceMeta}>{currentServiceLabel}</span>
              </div>

              <select
                value={currentTypeValue}
                onChange={(e) => handleChangeActiveOrderType(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                style={styles.serviceTypeSelect}
              >
                <option value="dining">Dining</option>
                <option value="to-go">To-Go</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          )}
        </div>
        {notification && (
          <div
            style={{
              ...styles.notification,
              ...(notification.type === "error"
                ? styles.notificationError
                : styles.notificationSuccess),
            }}
          >
            {notification.message}
          </div>
        )}
      </header>

      <nav style={styles.nav}>
        {isAdmin && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "table-layout" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("table-layout")}
          >
            Table Layout
          </button>
        )}

        {(isAdmin || isWaiterLike) && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "tables" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("tables")}
          >
            Tables
          </button>
        )}

        {allowedSections.includes("menu") && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "menu" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("menu")}
          >
            Menu
          </button>
        )}

        {allowedSections.includes("cart") && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "cart" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("cart")}
          >
            Cart
          </button>
        )}

        {(isAdmin || isWaiterLike) && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "order" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("order")}
          >
            Order
          </button>
        )}

        {isKitchen && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "kitchen" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("kitchen")}
          >
            Kitchen
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "report" ? styles.navButtonActive : {}),
            }}
            onClick={() => navigateToSection("report")}
          >
            Report
          </button>
        )}
      </nav>

      <main style={styles.content}>
        {currentSection === "table-layout" && isAdmin && (
          <TableLayoutSection
            tables={tables}
            onSaveTablesChanges={handleSaveTableLayout}
            selectedTableId={selectedTableId}
          />
        )}

        {currentSection === "tables" && (isAdmin || isWaiterLike) && (
          <TablesSection
            tables={displayTables}
            onOpenTable={handleOpenTable}
            selectedTableId={selectedTableId}
            disabledTableIds={isDiningAssignmentMode ? unavailableDiningTableIds : []}
            selectionMode={isDiningAssignmentMode ? "assign-dining" : "normal"}
            onCancelAssignDining={handleCancelAssignDining}
          />
        )}

        {currentSection === "menu" && (
          <MenuPage
            role={role}
            selectedTableId={selectedTableId}
            selectedTableName={selectedTable?.name || ""}
            activeServiceMode={serviceMode}
            activeCustomerOrder={activeCustomerOrder}
            onAddToCart={handleAddItemToPending}
            onOpenDining={() => {
              setServiceMode("dining");
              setActiveCustomerOrderId(null);
              setSelectedTableId(null);
              setPendingDiningSwitchOrderId("new-dining");
              setQueuedDiningItem(null);
              setActiveSection("tables");
            }}
            onStartDiningSelection={handleStartDiningSelection}
            onCustomerInfoSave={handleCreateCustomerOrder}
            onCreateCustomerOrderAndAddItem={handleCreateCustomerOrderAndAddItem}
            onChangeActiveOrderType={handleChangeActiveOrderType}
          />
        )}

        {currentSection === "cart" && (
          <CartSection
            role={role}
            selectedTableId={selectedTableId}
            selectedTableName={
              selectedTable?.name ||
              activeCustomerOrder?.customerName ||
              activeCustomerOrder?.orderNumber ||
              ""
            }
            currentOrder={activeOrderState.current}
            pendingOrder={activeOrderState.pending}
            onAddItemToPending={handleAddCurrentItemToPending}
            onIncreasePending={handleIncreasePending}
            onDecreasePending={handleDecreasePending}
            onRemovePending={handleRemovePending}
            onSendPending={handleSendPending}
            activeOrder={activeOrder}
            taxRate={TAX_RATE}
            onCheckout={handleCheckoutOrder}
            onNotify={showNotification}
          />
        )}

        {currentSection === "order" && (isAdmin || isWaiterLike) && (
          <OrderSection
            orders={effectiveOrders}
            currentUserName={mockUser.name}
            onSaveOrder={handleSaveOrder}
            onSendPendingForOrder={handleSendPendingForOrder}
            onDeletePendingDishes={handleDeletePendingDishes}
            onOpenOrderInMenu={handleOpenOrderInMenu}
            onCheckout={handleCheckoutOrder}
            taxRate={TAX_RATE}
            onRequestDiningAssignment={(order) => {
              if (!order) return;
              setPendingDiningSwitchOrderId(order.id);
              setDiningAssignmentSource("order-details");
              setQueuedDiningItem(null);
              setSelectedTableId(null);
              setActiveCustomerOrderId(order.id);
              setServiceMode("dining");
              setReopenOrderDetailsId(order.id);
              setActiveSection("tables");
            }}
            autoOpenOrderId={reopenOrderDetailsId}
            onAutoOpenOrderHandled={() => setReopenOrderDetailsId(null)}
          />
        )}

        {currentSection === "report" && isAdmin && (<ReportSection orders={orders} />)}

        {currentSection === "kitchen" && isKitchen && <KitchenSection 
            orders={orders}
            onToggleDishFinished={handleToggleDishFinished}
        />}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  header: {
    position: "relative",
    padding: "24px 28px 14px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
  },
  userText: {
    margin: 0,
    color: "#374151",
    fontWeight: 600,
  },
  servicePanel: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "#f9fafb",
    border: "2px solid #2563eb",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
    minWidth: "320px",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  serviceTextBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  serviceLabel: {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6b7280",
  },
  serviceOrderNumber: {
    fontSize: "24px",
    lineHeight: 1.1,
    color: "#111827",
  },
  serviceMeta: {
    fontSize: "14px",
    color: "#4b5563",
  },
  serviceTypeSelect: {
    minWidth: "140px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontWeight: 700,
    fontSize: "15px",
    color: "#111827",
    cursor: "pointer",
  },
  notification: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 20,
    minWidth: "280px",
    maxWidth: "420px",
    padding: "14px 18px",
    borderRadius: "14px",
    color: "#ffffff",
    fontWeight: 700,
    textAlign: "center",
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.18)",
  },
  notificationSuccess: {
    background: "#16a34a",
  },
  notificationError: {
    background: "#dc2626",
  },
  nav: {
    display: "flex",
    gap: "12px",
    padding: "16px 28px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  navButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    padding: "14px 22px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "16px",
    minWidth: "110px",
  },
  navButtonActive: {
    background: "#111827",
    color: "#ffffff",
    border: "1px solid #111827",
    transform: "scale(1.05)",
  },
  content: {
    padding: "24px 28px",
  },
};

export default POSPage;