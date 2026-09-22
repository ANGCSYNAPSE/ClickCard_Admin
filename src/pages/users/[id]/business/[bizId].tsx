import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { adminService } from "@/services/adminService";
import {
  Activity,
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
} from "lucide-react";

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export default function BusinessProfileDetailsPage() {
  const router = useRouter();
  const { id, bizId } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biz, setBiz] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady || !id || !bizId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await adminService.getUserDetails(id as string);
        const match = userData.businessProfiles?.find(
          (b: any) => String(b.id) === String(bizId)
        );
        if (!match) {
          setError("Business profile not found.");
        } else {
          setBiz(match);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching business profile:", err);
        setError("Failed to load business profile. Make sure your backend is running.");
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, id, bizId]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">
            <Activity className="text-primary" size={32} />
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Head>
        <title>Business Profile · ClickCard Admin</title>
      </Head>

      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/users/${id}`}
          className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-ink dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-white">
            Business Profile
          </h1>
          <p className="text-xs text-ink/60 dark:text-white/60">
            Users <span className="text-primary">›</span> User Details{" "}
            <span className="text-primary">›</span> Business Profile
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {biz && (
        <div className="space-y-6">
          {/* Header card */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <div className="flex items-start gap-4">
              {biz.logo_url ? (
                <img
                  src={biz.logo_url}
                  alt={biz.company_name}
                  className="h-20 w-20 rounded-xl object-cover shrink-0"
                />
              ) : (
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <Building2 size={32} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-ink dark:text-white truncate">
                  {biz.company_name}
                </h2>
                {biz.category && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                    {biz.category}
                  </span>
                )}
                {biz.description && (
                  <p className="mt-3 text-sm text-muted dark:text-white/60">{biz.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <h3 className="font-bold text-ink dark:text-white mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted dark:text-white/60 shrink-0" />
                <p className="text-sm text-ink dark:text-white break-all">{biz.website || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted dark:text-white/60 shrink-0" />
                <p className="text-sm text-ink dark:text-white break-all">{biz.email || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted dark:text-white/60 shrink-0" />
                <p className="text-sm text-ink dark:text-white">{biz.phone || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted dark:text-white/60 shrink-0" />
                <p className="text-sm text-ink dark:text-white">{biz.address || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <h3 className="font-bold text-ink dark:text-white mb-4">
              Documents ({biz.documents?.length || 0})
            </h3>
            {biz.documents && biz.documents.length > 0 ? (
              <div className="space-y-2">
                {biz.documents.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-paper-soft dark:bg-dark hover:bg-paper dark:hover:bg-dark/70 transition-colors"
                  >
                    <FileText size={16} className="shrink-0 text-muted dark:text-white/50" />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink dark:text-white">
                      {doc.name}
                    </span>
                    {doc.size ? (
                      <span className="shrink-0 text-xs text-muted dark:text-white/40">
                        {formatBytes(doc.size)}
                      </span>
                    ) : null}
                    <Download size={14} className="shrink-0 text-muted dark:text-white/50" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted dark:text-white/40">No documents uploaded.</p>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
