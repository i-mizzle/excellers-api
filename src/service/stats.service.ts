export const getTransactionSummary = (transactions: any[]) => {
    const today = new Date();
    const past10Days: Date[] = [];
    const past10Weeks: Date[] = [];
    const past10Months: Date[] = [];
    const dayTransactions: { [key: string]: any } = {};
    const weekTransactions: { [key: string]: any } = {};
    const monthTransactions: { [key: string]: any } = {};
  
    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        past10Days.push(date);
    }
  
    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - 7 * i);
        past10Weeks.push(date);
    }
  
    for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        past10Months.push(date);
    }
  
    past10Days.forEach((date) => {
        const dayKey = date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
        dayTransactions[dayKey] = { day: dayKey, amount: 0, transactionsByChannel: {} };
    });
  
    past10Weeks.forEach((date) => {
        const weekKey = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        weekTransactions[weekKey] = {
            week: weekKey,
            amount: 0,
            transactionsByChannel: {},
        };
    });
  
    past10Months.forEach((date) => {
        const monthKey = date.toLocaleString('en-US', { month: 'short' });
        monthTransactions[monthKey] = {
            month: monthKey,
            amount: 0,
            transactionsByChannel: {},
        };
    });
  
    transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        const dayKey = transactionDate.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
        const weekKey = `${transactionDate.getMonth() + 1}/${transactionDate.getDate()}/${transactionDate.getFullYear()}`;
        const monthKey = transactionDate.toLocaleString('en-US', { month: 'short' });
    
        if (dayTransactions[dayKey]) {
            dayTransactions[dayKey].amount += transaction.amount;
            if (!dayTransactions[dayKey].transactionsByChannel[transaction.channel]) {
                dayTransactions[dayKey].transactionsByChannel[transaction.channel] = 0;
            }
            dayTransactions[dayKey].transactionsByChannel[transaction.channel] += transaction.amount;
        }
    
        if (weekTransactions[weekKey]) {
            weekTransactions[weekKey].amount += transaction.amount;
            if (!weekTransactions[weekKey].transactionsByChannel[transaction.channel]) {
                weekTransactions[weekKey].transactionsByChannel[transaction.channel] = 0;
            }
            weekTransactions[weekKey].transactionsByChannel[transaction.channel] += transaction.amount;
        }
    
        if (monthTransactions[monthKey]) {
            monthTransactions[monthKey].amount += transaction.amount;
            if (!monthTransactions[monthKey].transactionsByChannel[transaction.channel]) {
                monthTransactions[monthKey].transactionsByChannel[transaction.channel] = 0;
            }
            monthTransactions[monthKey].transactionsByChannel[transaction.channel] += transaction.amount;
        }
    });
  
    const daySummary = Object.values(dayTransactions);
    const weekSummary = Object.values(weekTransactions);
    const monthSummary = Object.values(monthTransactions);
  
    return {
        daySummary,
        weekSummary,
        monthSummary,
    };
};
  
export const getTransactionsByChannel = (transactions: any[]) => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
  
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
  
    const currentDay = today.toDateString();
    const currentWeek = `${currentWeekStart.toLocaleDateString()} - ${today.toLocaleDateString()}`;
    const currentMonth = today.toLocaleString('en-US', { month: 'short' });
  
    const transactionsByChannel: {
        currentDay: { [key: string]: number };
        currentWeek: { [key: string]: number };
        currentMonth: { [key: string]: number };
    } = {
        currentDay: {},
        currentWeek: {},
        currentMonth: {},
    };
  
    transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        const transactionChannel = transaction.channel;
    
        if (transactionDate.toDateString() === currentDay) {
            if (!transactionsByChannel.currentDay[transactionChannel]) {
                transactionsByChannel.currentDay[transactionChannel] = 0;
            }
            transactionsByChannel.currentDay[transactionChannel] += transaction.amount;
        }
    
        if (transactionDate >= currentWeekStart && transactionDate <= today) {
            if (!transactionsByChannel.currentWeek[transactionChannel]) {
                transactionsByChannel.currentWeek[transactionChannel] = 0;
            }
            transactionsByChannel.currentWeek[transactionChannel] += transaction.amount;
        }
    
        if (transactionDate >= currentMonthStart && transactionDate <= today) {
            if (!transactionsByChannel.currentMonth[transactionChannel]) {
                transactionsByChannel.currentMonth[transactionChannel] = 0;
            }
            transactionsByChannel.currentMonth[transactionChannel] += transaction.amount;
        }
    });
  
    return transactionsByChannel;
};

export const listLowStockVariants = (inventory: any) => {
    const lowStockVariants: any = [];

    inventory.forEach((item: any) => {
        if(item?.type === 'sale') {
            item.variants.forEach((variant: any) => {
                if (variant.currentStock < variant.lowStockAlertCount) {
                    const lowStockInfo = {
                        id: item._id,
                        itemName: item.name,
                        variantName: variant.name,
                        currentStock: variant.currentStock,
                        saleUnit: variant.saleUnit,
                    };
                    lowStockVariants.push(lowStockInfo);
                }
            });
        }
        if(item?.type === 'store') {
            if (item.currentStock < item.lowStockAlertCount) {
                const lowStockInfo = {
                    id: item._id,
                    itemName: item.name,
                    variantName: '',
                    currentStock: item.currentStock,
                    saleUnit: item.stockUnit,
                };
                lowStockVariants.push(lowStockInfo);
            }
        }
    });

    return lowStockVariants;
}
  
export const calculateMetrics = (orders: any[]) => {
    let todayOrdersCount = 0;
    let todayOrdersValue = 0;
    let thisWeekOrdersCount = 0;
    let thisWeekOrdersValue = 0;
    let thisMonthOrdersCount = 0;
    let thisMonthOrdersValue = 0;
    let soldItems: { [key: string]: number } = {};
    let closedUnpaidOrdersCount = 0;
    let unpaidOrdersValue = 0;
    let currentYearOrdersValue = 0;
    const mostSoldItem = { name: '', quantity: 0 }; // Initialize mostSoldItem
  
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear() && date.getDate;
    };
  
    const isDateInCurrentMonth = (date: Date) => {
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };
  
    const isDateInCurrentWeek = (date: Date) => {
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay());
        return date >= currentWeekStart && date <= today;
    };

    for (const order of orders) {
        const { total, createdAt, status, paymentStatus, items } = order;
        const today = new Date()
        const orderDate = new Date(createdAt);

        if(paymentStatus === 'PAID' && isToday(createdAt)) {
            todayOrdersValue++
            todayOrdersValue += total
        }
  
        // Task 1: Total orders today and this month
        if (paymentStatus === 'PAID' && isDateInCurrentMonth(orderDate)) {
            thisMonthOrdersCount++;
            thisMonthOrdersValue += total;
  
        if (paymentStatus === 'PAID' && isDateInCurrentWeek(orderDate)) {
            thisWeekOrdersCount++;
            thisWeekOrdersValue += total;
        }
  
            // Task 3: Track sold items and find the most sold item
            for (const item of items) {
                const { displayName, quantity } = item;
                if (soldItems[displayName]) {
                    soldItems[displayName] += quantity;
                    if (soldItems[displayName] > mostSoldItem.quantity) {
                    mostSoldItem.name = displayName;
                    mostSoldItem.quantity = soldItems[displayName];
                    }
                } else {
                    soldItems[displayName] = quantity;
                    if (quantity > mostSoldItem.quantity) {
                    mostSoldItem.name = displayName;
                    mostSoldItem.quantity = quantity;
                    }
                }
            }
        }
  
        // Task 4: Count closed, unpaid orders
        if (status === 'CLOSED' && paymentStatus === 'UNPAID') {
            closedUnpaidOrdersCount++;
        }
    
        // Task 5: Count unpaid orders and their total value
        if (paymentStatus === 'UNPAID') {
            unpaidOrdersValue += total;
        }
    
        // Calculate the total value of orders in the current year
        if (orderDate.getFullYear() === new Date().getFullYear()) {
            currentYearOrdersValue += total;
        }
    }
    return {
        todayOrdersCount,
        todayOrdersValue,
        thisWeekOrdersCount,
        thisWeekOrdersValue,
        thisMonthOrdersCount,
        thisMonthOrdersValue,
        soldItems,
        mostSoldItem,
        closedUnpaidOrdersCount,
        unpaidOrdersValue,
        currentYearOrdersValue,
    };
};
  