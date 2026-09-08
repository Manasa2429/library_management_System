package com.library.dto;

public class PaymentProcessRequestDto {

    private String simulateOutcome; // "SUCCESS" (default) or "FAILED"

    public PaymentProcessRequestDto() {}

    public PaymentProcessRequestDto(String simulateOutcome) {
        this.simulateOutcome = simulateOutcome;
    }

    public String getSimulateOutcome() { return simulateOutcome; }
    public void setSimulateOutcome(String simulateOutcome) { this.simulateOutcome = simulateOutcome; }
}
