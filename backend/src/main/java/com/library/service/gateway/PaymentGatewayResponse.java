package com.library.service.gateway;

public class PaymentGatewayResponse {

    private boolean success;
    private String gatewayReference;
    private String message;
    private String errorCode;

    public PaymentGatewayResponse() {}

    public PaymentGatewayResponse(boolean success, String gatewayReference, String message, String errorCode) {
        this.success = success;
        this.gatewayReference = gatewayReference;
        this.message = message;
        this.errorCode = errorCode;
    }

    public static PaymentGatewayResponse successful(String gatewayReference, String message) {
        return new PaymentGatewayResponse(true, gatewayReference, message, null);
    }

    public static PaymentGatewayResponse failed(String errorCode, String message) {
        return new PaymentGatewayResponse(false, null, message, errorCode);
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getGatewayReference() { return gatewayReference; }
    public void setGatewayReference(String gatewayReference) { this.gatewayReference = gatewayReference; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
}
