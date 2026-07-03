"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(80);
  const [language, setLanguage] = useState("English");

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 700 }}>
      <h1>Settings</h1>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "#181818",
          borderRadius: 10,
        }}
      >
        <h3>Subscription</h3>
        <p>
          Current Plan: <b>{user.subscription.toUpperCase()}</b>
        </p>

        <button disabled style={{ marginTop: 10 }}>
          Upgrade Subscription (Phase 2)
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "#181818",
          borderRadius: 10,
        }}
      >
        <h3>Notifications</h3>

        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          Enable Notifications
        </label>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "#181818",
          borderRadius: 10,
        }}
      >
        <h3>Volume</h3>

        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />

        <p>{volume}%</p>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "#181818",
          borderRadius: 10,
        }}
      >
        <h3>Language</h3>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Persian</option>
        </select>
      </div>

      <button
        style={{
          marginTop: 30,
          background: "red",
          color: "white",
          padding: "10px 18px",
          borderRadius: 8,
        }}
        onClick={() => {
          if (confirm("Delete account?")) {
            alert("Phase 2");
          }
        }}
      >
        Delete Account
      </button>
    </div>
  );
}
