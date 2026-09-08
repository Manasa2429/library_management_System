package com.library.service.gateway;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class MockPaymentGateway implements PaymentGateway {

    private static final Logger logger = LoggerFactory.getLogger(MockPaymentGateway.class);

    @Override
    public PaymentGatewayResponse processPayment(PaymentGatewayRequest request) {
        logger.info(">>> [MOCK GATEWAY] Simulating online transaction {} for ₹{} via {}",
                request.getTransactionId(), request.getAmount(), request.getPaymentMethod());

        // Check if caller explicitly requested a simulated failure for demo/testing
        if ("FAILED".equalsIgnoreCase(request.getSimulateOutcome())) {
            logger.warn(">>> [MOCK GATEWAY] Controlled simulation of payment failure for {}", request.getTransactionId());
            return PaymentGatewayResponse.failed("DEMO_PAYMENT_FAILED", "Simulated demo payment failed as requested.");
        }

        String gwRef = "MOCK_GW_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        logger.info(">>> [MOCK GATEWAY] Successfully approved simulated transaction with reference {}", gwRef);

        return PaymentGatewayResponse.successful(gwRef, "Simulated transaction approved by mock gateway.");
    }
}
