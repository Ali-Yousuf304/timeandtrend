import * as React from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  useMyQueries,
  useQueryReplies,
  type CustomerQuery,
} from "@/hooks/use-customer-queries";
import { cn } from "@/lib/utils";

export function MyQueries({ userId }: { userId: string }) {
  const { queries, loading, reload } = useMyQueries(userId);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (loading) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading queries…</p>;
  }

  if (queries.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center">
        <Mail className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">You haven't sent any queries yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {queries.map((q) => (
        <div
          key={q.id}
          className="rounded-lg border border-border bg-card shadow-sm"
        >
          <button
            type="button"
            onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
            className="flex w-full items-start justify-between gap-3 p-4 text-left"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold line-clamp-1">{q.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
              </p>
            </div>
            {!q.is_read && (
              <Badge className="bg-[var(--gold)] text-[var(--gold-foreground)]">
                New
              </Badge>
            )}
          </button>
          {expandedId === q.id && <MyQueryThread query={q} onChange={reload} />}
        </div>
      ))}
    </div>
  );
}

function MyQueryThread({
  query,
  onChange,
}: {
  query: CustomerQuery;
  onChange: () => void;
}) {
  const { replies, loading, reload } = useQueryReplies(query.id);
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);

  async function send() {
    if (!reply.trim() || !query.user_id) return;
    setSending(true);
    const { error } = await supabase.from("customer_query_replies").insert({
      query_id: query.id,
      author_id: query.user_id,
      author_role: "customer",
      message: reply.trim(),
    });
    setSending(false);
    if (error) toast.error(error.message);
    else {
      setReply("");
      toast.success("Reply sent");
      reload();
      onChange();
    }
  }

  return (
    <div className="space-y-3 border-t border-border p-4">
      <div className="rounded-md bg-muted/50 p-3">
        <p className="mb-1 text-xs font-semibold text-muted-foreground">
          You · {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
        </p>
        <p className="whitespace-pre-wrap text-sm">{query.message}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading replies…</p>
      ) : (
        replies.map((r) => (
          <div
            key={r.id}
            className={cn(
              "rounded-md p-3",
              r.author_role === "admin"
                ? "bg-[var(--gold)]/10"
                : "bg-muted/50",
            )}
          >
            <p className="mb-1 text-xs font-semibold text-muted-foreground">
              {r.author_role === "admin" ? "Support" : "You"} ·{" "}
              {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
            </p>
            <p className="whitespace-pre-wrap text-sm">{r.message}</p>
          </div>
        ))
      )}

      {query.user_id && (
        <div className="space-y-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add to this conversation…"
            rows={2}
          />
          <Button
            onClick={send}
            disabled={sending || !reply.trim()}
            size="sm"
            className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
          >
            <Send className="mr-1 h-3.5 w-3.5" />
            {sending ? "Sending…" : "Send reply"}
          </Button>
        </div>
      )}
    </div>
  );
}
