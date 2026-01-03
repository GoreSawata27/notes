import React, { useEffect, useState } from "react";

type PriceData = {
  asset: string;
  price: string;
};

export default function WebSocketRealTimeData() {
  const [rows, setRows] = useState<PriceData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const ws = new WebSocket("wss://ws.coincap.io/prices?assets=ALL");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const updated: PriceData[] = Object.entries(data).map(([asset, price]) => ({
        asset,
        price: Number(price).toFixed(2),
      }));
      setRows(updated);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString());
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Realtime Prices (CoinCap WebSocket)</h1>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          marginBottom: "10px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Asset</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.asset}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.asset}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontStyle: "italic" }}>Last updated: {lastUpdated || "waiting for data..."}</p>
    </div>
  );
}
