import * as React from "react";
import { Mail, Trash2, CheckCircle2, Circle, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomerQueries } from "@/hooks/use-customer-queries";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function CustomerQueriesAdmin() {
  const { queries, loading, markRead, remove } = useCustomerQueries();
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
          {queries.map((q) => {
            const isOpen = expanded.has(q.id);
            return (
              <div
                key={q.id}
                className={`rounded-xl border bg-card p-4 transition-colors ${
                  q.is_read ? "border-border" : "border-[var(--gold)]/40 bg-[var(--gold)]/5"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(q.id)}
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
                        if (!confirm("Delete this query?")) return;
                        await remove(q.id);
                        toast.success("Query deleted");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-3 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">
                    {q.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
