import * as React from "react";
import { Mail, Trash2, CheckCircle2, Circle, MailOpen, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useCustomerQueries,
  useQueryReplies,
  type CustomerQuery,
} from "@/hooks/use-customer-queries";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function CustomerQueriesAdmin() {
  const { queries, loading, markRead, remove, reload } = useCustomerQueries();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggle = (q: CustomerQuery) => {
    const willOpen = expandedId !== q.id;
    setExpandedId(willOpen ? q.id : null);
    if (willOpen && !q.is_read) {
      markRead(q.id, true);
    }
  };

  const unreadCount = queries.filter((q) => !q.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Customer Queries</h1>
          <p className="text-sm text-muted-foreground">
            Messages submitted from the contact form.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {unreadCount} unread / {queries.length} total
        </Badge>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : queries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Mail className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No customer queries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queries.map((q) => (
            <div
              key={q.id}
              className={cn(
                "rounded-xl border bg-card transition-colors",
                q.is_read
                  ? "border-border"
                  : "border-[var(--gold)]/40 bg-[var(--gold)]/5",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggle(q)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    {q.is_read ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-[var(--gold)]" />
                    )}
                    <span className="font-medium">{q.name}</span>
                    {!q.is_read && (
                      <Badge className="bg-[var(--gold)] text-[var(--gold-foreground)]">
                        New
                      </Badge>
                    )}
                    {q.user_id && (
                      <Badge variant="outline" className="text-[10px]">
                        <User className="mr-1 h-3 w-3" /> Registered
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <a
                      href={`mailto:${q.email}`}
                      className="hover:text-[var(--gold)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {q.email}
                    </a>
                    {" · "}
                    {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await markRead(q.id, !q.is_read);
                      toast.success(q.is_read ? "Marked as unread" : "Marked as read");
                    }}
                  >
                    {q.is_read ? (
                      <Circle className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={async () => {
                      if (!confirm("Delete this query and all replies?")) return;
                      await remove(q.id);
                      toast.success("Query deleted");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {expandedId === q.id && (
                <QueryThread query={q} onChange={reload} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QueryThread({
  query,
  onChange,
}: {
  query: CustomerQuery;
  onChange: () => void;
}) {
  const { replies, loading, reload } = useQueryReplies(query.id);
  const { user } = useAuth();
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);

  async function send() {
    if (!reply.trim() || !user) return;
    setSending(true);
    const { error } = await supabase.from("customer_query_replies").insert({
      query_id: query.id,
      author_id: user.id,
      author_role: "admin",
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
    <div className="space-y-4 border-t border-border p-4">
      {/* Original message */}
      <div className="rounded-md bg-muted/50 p-3">
        <p className="mb-1 text-xs font-semibold text-muted-foreground">
          {query.name} · Original message
        </p>
        <p className="whitespace-pre-wrap text-sm">{query.message}</p>
      </div>

      {/* Replies */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading replies…</p>
      ) : replies.length > 0 ? (
        <div className="space-y-2">
          {replies.map((r) => (
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
                {r.author_role === "admin" ? "You (Admin)" : query.name} ·{" "}
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </p>
              <p className="whitespace-pre-wrap text-sm">{r.message}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Reply composer */}
      <div className="space-y-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply to the customer…"
          rows={3}
        />
        <Button
          onClick={send}
          disabled={sending || !reply.trim()}
          className="bg-[var(--gold)] text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
        >
          <Send className="mr-1 h-4 w-4" />
          {sending ? "Sending…" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}
