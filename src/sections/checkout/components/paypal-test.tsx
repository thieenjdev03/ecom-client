"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

import { PAYPAL_CONFIG } from "src/config/paypal";

// ----------------------------------------------------------------------

export default function PayPalTestComponent() {
  const [email, setEmail] = useState("test@example.com");
  const [amount, setAmount] = useState("10.00");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleCreateOrder = async (data: any, actions: any) => {
    addLog("Starting order creation...");
    
    try {
      // Test direct PayPal order creation
      const order = await actions.order.create({
        purchase_units: [
          {
            amount: {
              value: amount,
              currency_code: "USD",
            },
            description: "Test order",
          },
        ],
      });
      
      addLog(`Order created successfully: ${order}`);
      return order;
    } catch (error) {
      addLog(`Order creation failed: ${error}`);
      throw error;
    }
  };

  const handleApprove = async (data: any, actions: any) => {
    addLog("Starting order approval...");
    
    try {
      const details = await actions.order.capture();
      addLog(`Order approved successfully: ${JSON.stringify(details)}`);
    } catch (error) {
      addLog(`Order approval failed: ${error}`);
    }
  };

  const handleError = (err: any) => {
    addLog(`PayPal error: ${JSON.stringify(err)}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        PayPal Integration Test
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          
          <TextField
            label="Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />

          <Alert severity="info">
            <Typography variant="body2">
              Client ID: {PAYPAL_CONFIG.clientId}<br/>
              Environment: {PAYPAL_CONFIG.environment}<br/>
              Currency: {PAYPAL_CONFIG.currency}
            </Typography>
          </Alert>

          <PayPalScriptProvider
            options={{
              clientId: PAYPAL_CONFIG.clientId,
              currency: PAYPAL_CONFIG.currency,
              intent: PAYPAL_CONFIG.intent,
            }}
          >
            <PayPalButtons
              style={{ 
                layout: "vertical", 
                color: "blue",
                shape: "rect",
                height: 45,
              }}
              createOrder={handleCreateOrder}
              onApprove={handleApprove}
              onError={handleError}
              disabled={!email || !amount}
            />
          </PayPalScriptProvider>
        </Stack>
      </Card>

      <Card sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Debug Logs</Typography>
          <Button variant="outlined" size="small" onClick={clearLogs}>
            Clear Logs
          </Button>
        </Stack>
        
        <Box sx={{ 
          height: 300, 
          overflow: 'auto', 
          bgcolor: 'grey.100', 
          p: 2, 
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          {logs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No logs yet. Try creating an order to see debug information.
            </Typography>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))
          )}
        </Box>
      </Card>
    </Box>
  );
}
