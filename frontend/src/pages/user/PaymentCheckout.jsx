import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fineService } from "../../services/fineService";
import { paymentService } from "../../services/paymentService";
import { useToast } from "../../components/Toast";
import {
  CreditCardIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  ClockIcon,
  ReceiptIcon
} from "../../components/Icons";
import ConfettiEffect, { playSuccessChime } from "../../components/ConfettiEffect";

export default function PaymentCheckout() {
  const { fineId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [fine, setFine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [upiProvider, setUpiProvider] = useState("gpay");
  const [simulatedBank, setSimulatedBank] = useState("HDFC");

  // Processing & Demo States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [paymentResult, setPaymentResult] = useState(null); // { status: "SUCCESS" | "FAILED", data: ... }
  const [simulateOutcome, setSimulateOutcome] = useState("SUCCESS"); // Dev/demo control
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    async function loadFine() {
      setLoading(true);
      try {
        const fines = await fineService.getMyFines();
        const target = fines.find((f) => f.id === fineId);
        if (!target) {
          addToast("Fine penalty record not found.", "error");
          navigate("/user/fines");
          return;
        }
        if (target.status === "PAID") {
          addToast("This fine has already been settled.", "info");
          navigate("/user/fines");
          return;
        }
        setFine(target);
      } catch (err) {
        console.error(err);
        addToast("Failed to initialize checkout session.", "error");
        navigate("/user/fines");
      } finally {
        setLoading(false);
      }
    }
    loadFine();
  }, [fineId, navigate, addToast]);

  const handlePay = async () => {
    if (!fine || isProcessing) return;

    setIsProcessing(true);
    setProcessingStep(1);

    try {
      // Step 1: Initiate payment on backend
      const initiateRes = await paymentService.initiatePayment(fine.id, {
        paymentMethod: selectedMethod,
      });

      // Step 2: Simulated gateway handoff animation
      setProcessingStep(2);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 3: Backend authoritative processing
      setProcessingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 700));

      const processRes = await paymentService.processPayment(initiateRes.id, {
        simulateOutcome: simulateOutcome,
      });

      if (processRes.status === "SUCCESS") {
        setPaymentResult({ status: "SUCCESS", data: processRes });
        setConfettiKey((k) => k + 1);
        playSuccessChime();
        addToast("Payment completed successfully!", "success");
      } else {
        setPaymentResult({ status: "FAILED", data: processRes });
        addToast("Simulated payment failed as requested.", "error");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to complete transaction.";
      setPaymentResult({
        status: "FAILED",
        data: { failureReason: msg },
      });
      addToast(msg, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center theme-text-secondary">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Securing payment session...
      </div>
    );
  }

  // --- Processing Overlay ---
  if (isProcessing) {
    return (
      <div className="max-w-lg mx-auto py-12 px-6">
        <div className="theme-card rounded-3xl border theme-border p-8 shadow-xl text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CreditCardIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black theme-text-primary">Processing Demo Payment</h2>
            <p className="text-xs theme-text-secondary mt-1">Please do not refresh or close this window.</p>
          </div>

          {/* Stepper info */}
          <div className="space-y-2 text-xs text-left bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border theme-border">
            <div className={`flex items-center gap-2 ${processingStep >= 1 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "theme-text-secondary"}`}>
              <span>●</span>
              <span>1. Initiating secure simulated checkout session...</span>
            </div>
            <div className={`flex items-center gap-2 ${processingStep >= 2 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "theme-text-secondary"}`}>
              <span>●</span>
              <span>2. Simulating authorization via {selectedMethod.replace("_", " ")}...</span>
            </div>
            <div className={`flex items-center gap-2 ${processingStep >= 3 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "theme-text-secondary"}`}>
              <span>●</span>
              <span>3. Confirming settlement with library database...</span>
            </div>
          </div>

          <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 py-2 px-3 rounded-xl">
            Simulated payment: No actual money or banking credentials are being used.
          </div>
        </div>
      </div>
    );
  }

  // --- Success State with Celebratory Effects ---
  if (paymentResult && paymentResult.status === "SUCCESS") {
    const res = paymentResult.data;
    return (
      <div className="relative max-w-xl mx-auto py-8 px-4">
        {/* Full-Screen Confetti Cannon Burst */}
        <ConfettiEffect key={confettiKey} trigger={confettiKey} />

        {/* Radiant Ambient Glow Behind Card */}
        <div className="absolute top-1/4 -left-10 w-64 h-64 bg-emerald-500/15 dark:bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div
          className="absolute top-1/3 -right-10 w-64 h-64 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-3xl pointer-events-none animate-glow-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Pop-In Animated Success Card */}
        <div className="relative theme-card rounded-3xl border theme-border p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-pop-in">
          {/* Celebratory Checkmark with Ripple Wave Rings */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-success-ring pointer-events-none" />
            <div
              className="absolute inset-2 rounded-full bg-emerald-500/30 animate-success-ring pointer-events-none"
              style={{ animationDelay: "0.4s" }}
            />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-checkmark-circle">
              <svg
                className="w-12 h-12 stroke-white"
                viewBox="0 0 52 52"
                fill="none"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="animate-checkmark-path" d="M14 27 L22 35 L38 17" />
              </svg>
            </div>
          </div>

          {/* Headline & Amount */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Payment Successful & Settled
            </span>
            <h2 className="text-4xl sm:text-5xl font-black theme-text-primary tracking-tight pt-1">
              ₹{res.amount?.toFixed(2)}
            </h2>
            <p className="text-xs theme-text-secondary max-w-sm mx-auto">
              Your overdue fine penalty has been cleared instantly. Account dues updated to ₹0.00!
            </p>
          </div>

          {/* Official Verification Security Pill */}
          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official SmartLibrary Receipt • Transaction Verified</span>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border theme-border p-5 text-xs space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary">Transaction ID</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20">
                {res.transactionId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary">Book Title</span>
              <span className="font-semibold theme-text-primary truncate max-w-[220px]" title={res.bookTitle}>
                {res.bookTitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary">Payment Method</span>
              <span className="font-bold theme-text-primary uppercase tracking-wide">
                {res.paymentMethod?.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary">Settlement Time</span>
              <span className="font-semibold theme-text-primary">
                {res.paidAt ? res.paidAt.replace("T", " ").substring(0, 19) : "Just now"}
              </span>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/user/payments/${res.id}/receipt`)}
                className="flex-1 py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <ReceiptIcon className="w-4 h-4" />
                View & Print Official Receipt
              </button>
              <button
                onClick={() => {
                  setConfettiKey((k) => k + 1);
                  playSuccessChime();
                }}
                className="py-3 px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
                title="Trigger celebratory confetti and chime again"
              >
                🎉 Celebrate Again
              </button>
            </div>
            <button
              onClick={() => navigate("/user/fines")}
              className="w-full py-2.5 px-4 text-xs font-semibold theme-card-subtle theme-text-secondary hover:theme-text-primary border theme-border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Return to My Fines
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Failure State ---
  if (paymentResult && paymentResult.status === "FAILED") {
    const res = paymentResult.data;
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="theme-card rounded-3xl border theme-border p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangleIcon className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Payment Failed
            </span>
            <h2 className="text-2xl font-black theme-text-primary mt-1">Transaction Could Not Complete</h2>
            <p className="text-xs text-rose-500 mt-1">
              {res.failureReason || "The simulated demo transaction was declined."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border theme-border text-xs text-left">
            <p className="theme-text-secondary leading-relaxed">
              Your fine of <strong>₹{fine?.fineAmount}</strong> for <strong>{fine?.bookTitle}</strong> remains{" "}
              <span className="text-rose-600 font-bold">UNPAID</span> in the library records. You can try again or select
              another payment method.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setPaymentResult(null);
                setSimulateOutcome("SUCCESS");
              }}
              className="flex-1 py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/user/fines")}
              className="py-3 px-5 text-xs font-semibold theme-card-subtle theme-text-primary border theme-border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Back to My Fines
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Normal Checkout Screen ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs theme-text-secondary">
        <Link to="/user/fines" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          My Fines
        </Link>
        <span>&rarr;</span>
        <span className="theme-text-primary font-semibold">Payment Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Method Selector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="theme-card rounded-3xl border theme-border p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold theme-text-primary">Select Payment Method</h2>
              <p className="text-xs theme-text-secondary mt-1">Choose your preferred simulated online payment channel</p>
            </div>

            {/* Methods Options */}
            <div className="space-y-3">
              {/* UPI */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  selectedMethod === "UPI"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm"
                    : "theme-border theme-card-subtle hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={selectedMethod === "UPI"}
                  onChange={() => setSelectedMethod("UPI")}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold theme-text-primary">UPI Instant Pay</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs theme-text-secondary mt-0.5">
                    Google Pay, PhonePe, Paytm, or any simulated UPI app
                  </p>

                  {selectedMethod === "UPI" && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {["gpay", "phonepe", "paytm"].map((provider) => (
                        <button
                          key={provider}
                          type="button"
                          onClick={() => setUpiProvider(provider)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition capitalize ${
                            upiProvider === provider
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "theme-border theme-card theme-text-secondary hover:theme-text-primary"
                          }`}
                        >
                          {provider === "gpay" ? "Google Pay" : provider === "phonepe" ? "PhonePe" : "Paytm"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              {/* Credit Card */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  selectedMethod === "CREDIT_CARD"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm"
                    : "theme-border theme-card-subtle hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CREDIT_CARD"
                  checked={selectedMethod === "CREDIT_CARD"}
                  onChange={() => setSelectedMethod("CREDIT_CARD")}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold theme-text-primary">Credit Card</span>
                  <p className="text-xs theme-text-secondary mt-0.5">Simulated Visa, Mastercard, RuPay credit cards</p>
                  {selectedMethod === "CREDIT_CARD" && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                      ✓ Demo simulation active — no real card number or CVV required.
                    </p>
                  )}
                </div>
              </label>

              {/* Debit Card */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  selectedMethod === "DEBIT_CARD"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm"
                    : "theme-border theme-card-subtle hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="DEBIT_CARD"
                  checked={selectedMethod === "DEBIT_CARD"}
                  onChange={() => setSelectedMethod("DEBIT_CARD")}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold theme-text-primary">Debit Card</span>
                  <p className="text-xs theme-text-secondary mt-0.5">All major bank debit cards (Demo simulation)</p>
                  {selectedMethod === "DEBIT_CARD" && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                      ✓ Demo simulation active — instant 1-click test settlement.
                    </p>
                  )}
                </div>
              </label>

              {/* Net Banking */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  selectedMethod === "NET_BANKING"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm"
                    : "theme-border theme-card-subtle hover:bg-slate-50 dark:hover:bg-slate-900/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="NET_BANKING"
                  checked={selectedMethod === "NET_BANKING"}
                  onChange={() => setSelectedMethod("NET_BANKING")}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold theme-text-primary">Net Banking</span>
                  <p className="text-xs theme-text-secondary mt-0.5">Simulate payment via leading Indian banks</p>

                  {selectedMethod === "NET_BANKING" && (
                    <div className="mt-3 flex gap-2">
                      {["HDFC", "SBI", "ICICI", "Axis"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSimulatedBank(bank)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition ${
                            simulatedBank === bank
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "theme-border theme-card theme-text-secondary hover:theme-text-primary"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Prominent Demo Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Demo Payment Environment</span>
                This system runs on a self-contained mock gateway. No real money, credit cards, or UPI PINs will be charged or stored.
              </div>
            </div>

            {/* Developer / Demo Simulation Toggle */}
            <div className="pt-2 border-t theme-border flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Demo Testing Result:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSimulateOutcome("SUCCESS")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                    simulateOutcome === "SUCCESS"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "theme-card-subtle theme-text-secondary theme-border"
                  }`}
                >
                  ✓ Simulate Success
                </button>
                <button
                  type="button"
                  onClick={() => setSimulateOutcome("FAILED")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition ${
                    simulateOutcome === "FAILED"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "theme-card-subtle theme-text-secondary theme-border"
                  }`}
                >
                  ✕ Simulate Failure
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="theme-card rounded-3xl border theme-border p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold theme-text-primary">Payment Summary</h3>

            <div className="flex items-start gap-4 pb-6 border-b theme-border">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold theme-text-primary truncate">{fine.bookTitle}</h4>
                <div className="flex items-center gap-2 text-xs theme-text-secondary mt-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>{fine.overdueDays} days overdue</span>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between theme-text-secondary">
                <span>Overdue Penalty</span>
                <span>₹{fine.fineAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between theme-text-secondary">
                <span>Convenience / Gateway Fee</span>
                <span className="text-emerald-600 font-semibold">FREE (Demo)</span>
              </div>
              <div className="flex justify-between theme-text-secondary">
                <span>Tax (GST)</span>
                <span>₹0.00</span>
              </div>
              <div className="pt-3 border-t theme-border flex justify-between items-center">
                <span className="text-sm font-bold theme-text-primary">Total Payable</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹{fine.fineAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePay}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCardIcon className="w-4 h-4" />
              Pay ₹{fine.fineAmount?.toFixed(2)} Now
            </button>

            <div className="text-center">
              <Link to="/user/fines" className="text-xs theme-text-secondary hover:theme-text-primary underline">
                Cancel and return to My Fines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
