import React from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Notifications component to display in-app reminders for upcoming scheduled tasks/events.
 * - notifications: array of notification objects
 * - onDismiss: function to dismiss a notification by id
 * - onShowCenter: function to open notification center/page
 */
function Notifications({ notifications, onDismiss, onShowCenter }) {
  // Hide if there are no notifications
  if (!notifications || notifications.length === 0) return null;

  // Notification bar styles
  const barStyle = {
    position: "fixed",
    top: 68, // below navbar
    left: 0,
    right: 0,
    zIndex: 500,
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    alignItems: "center",
    pointerEvents: "none",
    // Only reserve space above content when banner is visible
  };

  // Banner style per notification
  const bannerStyle = {
    background: "rgba(30,30,30,0.99)",
    color: "var(--text-color)",
    border: "1.5px solid var(--accent,#2196F3)",
    borderRadius: 8,
    minWidth: 270,
    maxWidth: 440,
    boxShadow: "0 2px 22px -5px #10152288",
    margin: "0 auto",
    padding: "13px 46px 13px 22px",
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    fontSize: "1.04em",
    lineHeight: 1.22,
    position: "relative",
    pointerEvents: "auto",
    opacity: 0.97,
    cursor: "default",
    transition: "box-shadow 0.16s",
  };

  const closeBtnStyle = {
    position: "absolute",
    right: 11,
    top: 6,
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: 19,
    cursor: "pointer",
    padding: 0,
    opacity: 0.7,
    transition: "color 0.13s",
    fontWeight: 900,
  };

  const badgeStyle = {
    marginRight: 12,
    fontSize: 19,
    color: "var(--accent,#2196F3)",
    verticalAlign: "middle",
    fontWeight: 600,
  };

  return (
    <div style={barStyle} aria-live="polite" aria-label="Upcoming notifications">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          style={bannerStyle}
          tabIndex={0}
          role="alert"
          aria-label={notif.text}
        >
          <span style={badgeStyle} aria-hidden="true">
            {notif.icon || "⏰"}
          </span>
          <span>
            {notif.text}
            {notif.time &&
              <span style={{
                color: "var(--text-secondary)",
                fontWeight: 400,
                marginLeft: 9,
                fontSize: "0.96em"
              }}>
                {notif.time}
              </span>
            }
          </span>
          {/* Dismiss/X button */}
          <button
            style={closeBtnStyle}
            aria-label="Dismiss notification"
            title="Dismiss"
            onClick={() => onDismiss(notif.id)}
          >
            ×
          </button>
        </div>
      ))}
      {/* Optionally: Link/badge to see all notifications */}
      <button
        className="btn"
        aria-label="Notification Center"
        style={{
          marginTop: 3,
          background: "var(--kavia-orange)",
          color: "#fff",
          fontSize: "0.91em",
          padding: "6px 17px",
          minHeight: 0,
          minWidth: 0,
          borderRadius: 8,
          boxShadow: "0 2px 10px #181a1c48",
          pointerEvents: "auto"
        }}
        onClick={onShowCenter}
      >
        View All Reminders
      </button>
    </div>
  );
}

export default Notifications;
