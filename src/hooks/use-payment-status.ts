import axios from "axios";

// ----------------------------------------------------------------------

interface PaymentStatusResponse {
  status: string;
  orderId: string;
  amount?: number;
  currency?: string;
  timestamp?: string;
}

// ----------------------------------------------------------------------

export const checkPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse | null> => {
  try {
    const res = await axios.get(`/orders/${orderId}/status`);
    
    if (res.data.status === "PAID") {
      console.log("✅ Payment verified!");
      return res.data;
    }
    
    return res.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return null;
  }
};

// ----------------------------------------------------------------------

export const pollPaymentStatus = async (
  orderId: string, 
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<PaymentStatusResponse | null> => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await checkPaymentStatus(orderId);
    
    if (status?.status === "PAID") {
      return status;
    }
    
    if (status?.status === "FAILED" || status?.status === "CANCELLED") {
      return status;
    }
    
    attempts++;
    
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  return null; // Timeout
};

// ----------------------------------------------------------------------

export const usePaymentStatusCheck = () => {
  const checkStatus = async (orderId: string) => {
    return await checkPaymentStatus(orderId);
  };
  
  const pollStatus = async (orderId: string, maxAttempts?: number, intervalMs?: number) => {
    return await pollPaymentStatus(orderId, maxAttempts, intervalMs);
  };
  
  return {
    checkStatus,
    pollStatus,
  };
};
