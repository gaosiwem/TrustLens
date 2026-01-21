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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan || "FREE");
        setFeatures(data.features || {});
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
        features,
        loading,
        refreshSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
