package com.library.dto;

import com.library.model.PaymentMethod;

public class PaymentInitiateRequestDto {

    private PaymentMethod paymentMethod = PaymentMethod.UPI;
    private String notes;

    public PaymentInitiateRequestDto() {}

    public PaymentInitiateRequestDto(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
