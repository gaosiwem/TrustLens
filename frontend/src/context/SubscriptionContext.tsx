"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

export type Plan =
  | "FREE"
  | "PRO"
  | "BUSINESS"
  | "ENTERPRISE"
  | "VERIFIED"
  | "BASIC_VERIFIED"
  | "PREMIUM_VERIFIED";

interface SubscriptionContextType {
  plan: Plan;
  activePlans: Plan[];
  features: Record<string, boolean>;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined,
);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlan] = useState<Plan>("FREE");
  const [activePlans, setActivePlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const token =
        (session as any)?.accessToken ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        setPlan("FREE");
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/subscriptions/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setPlan(data.plan || "FREE");
          setActivePlans(data.activePlans || []);
          setFeatures(data.features || {});
        } else {
          console.warn(
            "[SubscriptionContext] Expected JSON response but received",
            contentType,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        activePlans,
        features,
        loading,
        refreshSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
