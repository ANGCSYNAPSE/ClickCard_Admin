import { AdminReferral } from "@/services/adminService";

interface ReferralsTableProps {
  referrals: AdminReferral[];
}

export default function ReferralsTable({ referrals }: ReferralsTableProps) {
  const getStatusBadge = (status: string) => {
    const isCompleted = status === "profile_completed";
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 ${
          isCompleted
            ? "bg-green-50 dark:bg-green-500/20"
            : "bg-yellow-50 dark:bg-yellow-500/20"
        }`}
      >
        <span
          className={`text-sm font-medium capitalize ${
            isCompleted
              ? "text-green-700 dark:text-green-400"
              : "text-yellow-700 dark:text-yellow-600"
          }`}
        >
          {status.replace(/_/g, " ")}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line/50 dark:border-line/10 bg-paper-soft dark:bg-dark/50">
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Referrer
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Referred user
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr
                key={r.id}
                className="border-b border-line/30 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    @{r.referrer_username}
                  </p>
                  <p className="text-xs text-muted dark:text-white/60">{r.referrer_email}</p>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    @{r.referred_username}
                  </p>
                  <p className="text-xs text-muted dark:text-white/60">{r.referred_email}</p>
                </td>

                <td className="px-6 py-4">{getStatusBadge(r.status)}</td>

                <td className="px-6 py-4">
                  <p className="text-sm text-ink dark:text-white">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {referrals.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-sm text-muted dark:text-white/60">No referrals yet.</p>
        </div>
      )}
    </div>
  );
}
