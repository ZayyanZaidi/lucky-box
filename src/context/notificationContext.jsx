import { createContext, useContext, useState, useCallback } from "react";
import "../styles/notification.css";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const show = useCallback((msg, opts = {}) => {
    const id = Date.now() + Math.random();
    const notification = { id, msg, type: opts.type || "info", timeout: opts.timeout || 4000 };
    setNotifications((s) => [...s, notification]);
    if (notification.timeout > 0) {
      setTimeout(() => {
        setNotifications((s) => s.filter((n) => n.id !== id));
      }, notification.timeout);
    }
    return id;
  }, []);

  const hide = useCallback((id) => setNotifications((s) => s.filter((n) => n.id !== id)), []);

  return (
    <NotificationContext.Provider value={{ notifications, show, hide }}>
      {children}
      <div className="notification-root">
        {notifications.map((n) => (
          <div key={n.id} className={`notification ${n.type}`}>
            <div className="title">{n.type.toUpperCase()}</div>
            <div className="msg">{n.msg}</div>
            <div className="actions">
              <button onClick={() => hide(n.id)} className="dismiss">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
