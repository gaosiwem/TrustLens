"use client";

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
  };
  onMarkRead?: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      complaint: "receipt_long",
      resolution: "check_circle",
      feedback: "star",
      system: "info",
      warning: "warning",
    };
    return icons[type.toLowerCase()] || "notifications";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      complaint: "text-blue-600 dark:text-blue-400",
      resolution: "text-green-600 dark:text-green-400",
      feedback: "text-yellow-600 dark:text-yellow-400",
      system: "text-gray-600 dark:text-gray-400",
      warning: "text-red-600 dark:text-red-400",
    };
    return colors[type.toLowerCase()] || "text-gray-600 dark:text-gray-400";
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        notification.read
          ? "bg-muted/50 border-border"
          : "bg-card border-primary/30 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${getTypeColor(notification.type)}`}>
          <span className="material-symbols-outlined text-xl">
            {getTypeIcon(notification.type)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className={`text-sm font-medium ${
                notification.read ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {notification.type.charAt(0).toUpperCase() +
                notification.type.slice(1)}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p
            className={`text-sm ${
              notification.read ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {notification.message}
          </p>

          {!notification.read && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="mt-2 text-xs text-primary hover:underline font-medium"
            >
              Mark as read
            </button>
          )}
        </div>

        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
