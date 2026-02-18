import sendCustomerEmail from "./src/lib/send-email.js";

sendCustomerEmail("alengscaria13@gmail.com", {
    id: "1023",
    date: "17 Feb 2026",
    customerName: "Test User",
    phone: "9999999999",
    address: "Kakkanad, Kochi",
    subtotal: 499,
    delivery: 40,
    total: 539,
    items: [
        { name: "Panchasara Bottle", quantity: 1, total: 499 },
    ],
});
