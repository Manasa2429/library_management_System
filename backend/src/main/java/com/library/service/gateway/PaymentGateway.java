package com.library.service.gateway;

public interface PaymentGateway {
    PaymentGatewayResponse processPayment(PaymentGatewayRequest request);
}
