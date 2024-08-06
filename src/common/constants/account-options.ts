export const ACCOUNT_STATUS_LIST = [
 { name: "OK" },
 { name: "1-29 Days Overdue" },
 { name: "30-60 Days Overdue" },
 { name: "60-90 Days Overdue" },
 { name: "90-150 Days Overdue" },
 { name: "150+ Days Overdue" },
];

export const ACCOUNT_ACTIVITY_LIST = [
 { name: "All Activity" },
 { name: "Active data" },
 { name: "Deleted payments" },
];

export const ACCOUNT_PAYMENT_METHODS = [
 { name: "Check", id: 0 },
 { name: "Cash", id: 1 },
 { name: "VISA", id: 2 },
 { name: "MC", id: 3 },
 { name: "Discovery", id: 4 },
 { name: "AMEX", id: 5 },
 { name: "Debit", id: 6 },
 { name: "ACH", id: 7 },
 { name: "Money Order", id: 8 },
 { name: "Western Union", id: 9 },
 { name: "Travel Check", id: 10 },
 { name: "Bank Check", id: 11 },
 { name: "Trade-In", id: 12 },
];

export const ACCOUNT_FEE_TYPES = [
 { name: "Other", id: 0 },
 { name: "Late Fee", id: 1 },
 { name: "NSF Charge", id: 2 },
 { name: "Returned Check Fee", id: 3 },
 { name: "Mechanical Repair Fee", id: 4 },
 { name: "Repo Fee", id: 5 },
 { name: "Tow Fee", id: 6 },
 { name: "Garage Fee", id: 7 },
 { name: "Property Tax", id: 8 },
 { name: "Interest", id: 9 },
];

export const ACCOUNT_PAYMENT_TYPES = [
 { name: "Fee", id: 0 },
 { name: "Adjustment", id: 1 },
 { name: "Down Payment", id: 2 },
 { name: "Pickup Payment", id: 3 },
 { name: "QuickPay Payment", id: 4 },
 { name: "Payoff Payment", id: 5 },
];

export const ACCOUNT_PAYMENT_STATUS_LIST = [{ name: "All Payments" }, { name: "Exclude Deleted" }];
