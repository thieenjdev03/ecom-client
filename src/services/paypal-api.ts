import { PAYPAL_CONFIG } from "src/config/paypal";

// ----------------------------------------------------------------------

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Updated interfaces based on the documentation flow
interface CreatePayPalOrderRequest {
  value: string;
  currency: string;
  description: string;
}

interface CreatePayPalOrderResponse {
  success: boolean;
  orderId: string;
  approveUrl: string;
  status: string;
}

// Legacy interfaces for backward compatibility
interface CreateOrderRequest {
  amount: number;
  currency: string;
  description: string;
  items: any[];
  customerEmail: string;
  customerName: string;
}

interface CreateOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface CaptureOrderResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
    items?: Array<{
      name: string;
      quantity: number;
      unit_amount: {
        value: string;
        currency_code: string;
      };
    }>;
  }>;
  payer?: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
}

interface OrderHistoryResponse {
  orders: Array<{
    id: string;
    status: string;
    total: number;
    currency: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      image?: string;
      variant?: string;
    }>;
    createdAt: string;
    updatedAt: string;
    customerEmail: string;
    customerName: string;
    paymentMethod: string;
    shippingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>;
}

interface EmailConfirmationRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  items: any[];
  paymentDetails: any;
}

interface FileUploadResponse {
  url: string;
  public_id: string;
  secure_url: string;
}

// ----------------------------------------------------------------------

class PayPalApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Utility function to extract data from nested backend response
  private extractData(responseData: any): any {
    // Handle various nested data structures from backend
    if (responseData.data && responseData.data.data && responseData.data.data.data) {
      // Backend returns: { success: true, data: { data: { success: true, data: { id: "..." } } } }
      return responseData.data.data.data;
    } else if (responseData.data && responseData.data.data) {
      // Backend returns: { success: true, data: { data: { id: "..." } } }
      return responseData.data.data;
    } else if (responseData.data) {
      // Backend returns: { success: true, data: { id: "..." } }
      return responseData.data;
    } else {
      // Direct response: { id: "..." }
      return responseData;
    }
  }

  private getFileUploadHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Create PayPal order (new flow from documentation)
  async createPayPalOrder(request: CreatePayPalOrderRequest): Promise<ApiResponse<CreatePayPalOrderResponse>> {
    try {
      console.log('API Service: Creating PayPal order with request:', request);
      
      const response = await fetch(PAYPAL_CONFIG.apiEndpoints.createOrder, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      console.log('API Service: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Service: Response data:', responseData);
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('API Service: Error creating PayPal order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create PayPal order' 
      };
    }
  }

  // Legacy create order method (for backward compatibility)
  async createOrder(request: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    try {
      console.log('API Service: Creating PayPal order with request:', request);
      
      const response = await fetch(PAYPAL_CONFIG.apiEndpoints.createOrder, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      console.log('API Service: Response status:', response.status);
      console.log('API Service: Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Service: Response data:', responseData);
      
      // Extract data from nested backend response
      const orderData = this.extractData(responseData);
      console.log('API Service: Extracted order data:', orderData);
      
      return { success: true, data: orderData };
    } catch (error) {
      console.error('API Service: Error creating PayPal order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      };
    }
  }

  // Capture PayPal order
  async captureOrder(orderId: string): Promise<ApiResponse<CaptureOrderResponse>> {
    try {
      console.log('API Service: Capturing PayPal order:', orderId);
      
      const response = await fetch(`${PAYPAL_CONFIG.apiEndpoints.captureOrder}/${orderId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      console.log('API Service: Capture response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Capture error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Service: Capture response data:', responseData);
      
      // Extract data from nested backend response
      const captureData = this.extractData(responseData);
      console.log('API Service: Extracted capture data:', captureData);
      
      return { success: true, data: captureData };
    } catch (error) {
      console.error('API Service: Error capturing PayPal order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to capture order' 
      };
    }
  }

  // Get order details
  async getOrderDetails(orderId: string): Promise<ApiResponse<CaptureOrderResponse>> {
    try {
      console.log('API Service: Getting order details:', orderId);
      
      const response = await fetch(`${PAYPAL_CONFIG.apiEndpoints.orderDetails}/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log('API Service: Order details response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Service: Order details error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Service: Order details response data:', responseData);
      
      // Extract data from nested backend response
      const orderData = this.extractData(responseData);
      console.log('API Service: Extracted order details:', orderData);
      
      return { success: true, data: orderData };
    } catch (error) {
      console.error('API Service: Error fetching order details:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order details' 
      };
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(request: EmailConfirmationRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(PAYPAL_CONFIG.apiEndpoints.mailConfirmation, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  // Upload file
  async uploadFile(file: File, orderId: string): Promise<ApiResponse<FileUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'orders');
      formData.append('publicId', `order_${orderId}_${Date.now()}`);

      const response = await fetch(PAYPAL_CONFIG.apiEndpoints.fileUpload, {
        method: 'POST',
        headers: this.getFileUploadHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload file' 
      };
    }
  }

  // Get order history
  async getOrderHistory(): Promise<ApiResponse<OrderHistoryResponse>> {
    try {
      const response = await fetch(PAYPAL_CONFIG.apiEndpoints.orderHistory, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching order history:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order history' 
      };
    }
  }
}

// Export singleton instance
export const paypalApiService = new PayPalApiService();

// Export types for use in components
export type {
  ApiResponse,
  CreatePayPalOrderRequest,
  CreatePayPalOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  CaptureOrderResponse,
  OrderHistoryResponse,
  EmailConfirmationRequest,
  FileUploadResponse,
};
