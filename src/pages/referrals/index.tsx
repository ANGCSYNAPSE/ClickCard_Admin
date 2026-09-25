import { useEffect, useState } from "react";
import Head from "next/head";
import { AlertCircle, Activity, Gift, Users, UserCheck } from "lucide-react";
import AdminShell from "@/components/AdminShell";
import ReferralsTable from "@/components/referrals/ReferralsTable";
import { adminService, AdminReferral } from "@/services/adminService";
import { useRequireAdminAuth } from "@/lib/authGuards";

export default function ReferralsPage() {
  useRequireAdminAuth();

  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getReferrals();
        setReferrals(data);
      } catch (err) {
        console.error("Failed to fetch referrals:", err);
        setError("Failed to load referrals. Make sure your backend is running.");
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const completedCount = referrals.filter((r) => r.status === "profile_completed").length;

  const stats = [
    { label: "Total referrals", value: referrals.length, icon: Users },
    { label: "Completed profiles", value: completedCount, icon: UserCheck },
    { label: "Unique referrers", value: new Set(referrals.map((r) => r.referrer_id)).size, icon: Gift },
  ];

  return (
    <AdminShell>
      <Head>
        <title>Referrals · ClickCard Admin</title>
      </Head>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink dark:text-white">Referrals</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
          Track who referred whom and how many signups converted.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 p-5"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white">
              <s.icon size={20} />
            </span>
            <p className="mt-4 text-2xl font-black text-ink dark:text-white">{s.value}</p>
            <p className="text-sm text-muted dark:text-white/60">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-dark-hover rounded-2xl p-12 border border-line/50 dark:border-line/10 flex flex-col items-center justify-center">
          <Activity className="text-primary mb-4 animate-spin" size={32} />
          <p className="text-ink dark:text-white font-medium">Loading referrals...</p>
        </div>
      ) : (
        <ReferralsTable referrals={referrals} />
      )}
    </AdminShell>
  );
}
