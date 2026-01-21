"use client";
import { useEffect, useState } from "react";
import InputField from "@/components/InputField";
import Button from "@/components/Button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    if (session?.user) {
      setEmail(session.user.email || "");
      setName(session.user.name || "");
    }
  }, [session, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock update
    setTimeout(() => {
      alert("Profile updated successfully!");
      setLoading(false);
    }, 1000);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-8 p-8 max-w-2xl w-full bg-white dark:bg-[#1a2c34] rounded-2xl shadow-xl border border-[#dce0e5] dark:border-[#2c3e46]">
      <div className="flex items-center gap-6 border-b border-[#dce0e5] dark:border-[#2c3e46] pb-6">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {name.charAt(0) || email.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111618] dark:text-white">
            {name || "User Profile"}
          </h1>
          <p className="text-[#637588] dark:text-[#93a2b7]">{email}</p>
        </div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <InputField
          label="Full Name"
          type="text"
          icon="person"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          label="Email Address"
          type="email"
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled
        />
        <InputField
          label="Phone Number"
          type="tel"
          icon="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="md:col-span-2 flex justify-end">
          <div className="w-full md:w-48">
            <Button type="submit">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
