package com.library.service.gateway;

import com.library.model.PaymentMethod;

public class PaymentGatewayRequest {

    private String transactionId;
    private double amount;
    private PaymentMethod paymentMethod;
    private String customerEmail;
    private String customerName;
    private String simulateOutcome; // "SUCCESS", "FAILED", or null (default SUCCESS)

    public PaymentGatewayRequest() {}

    public PaymentGatewayRequest(String transactionId, double amount, PaymentMethod paymentMethod,
                                 String customerEmail, String customerName, String simulateOutcome) {
        this.transactionId = transactionId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.simulateOutcome = simulateOutcome;
    }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getSimulateOutcome() { return simulateOutcome; }
    public void setSimulateOutcome(String simulateOutcome) { this.simulateOutcome = simulateOutcome; }
}
