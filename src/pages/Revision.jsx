import React from "react";
import { FolderClock, RotateCcw, Clock3, CheckCircle2 } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";

const dayLabel = (d) => {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d === today) return "today";
  if (d === y) return "yesterday";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function RevisionPage(p) {
  const Group = ({ title, items, icon: Icon, showComplete }) => (
    <Card>
      <SectionTitle icon={Icon}>{title} <span className="sb-muted">({items.length})</span></SectionTitle>
      {items.length === 0 ? <EmptyState mascot={p.mascot} mood="idle" text="Nothing here." /> : items.map((r) => (
        <div key={r.id} className="sb-revision-row">
          <div><b>{r.chapter}</b><div className="sb-muted">{r.subject} · Revision {r.revision_number} · due {dayLabel(r.due_date)}</div></div>
          {showComplete && <Btn variant="soft" onClick={() => p.completeRevision(r.id)}><CheckCircle2 size={16} /> Done</Btn>}
        </div>
      ))}
    </Card>
  );
  return (
    <div className="sb-page">
      <Group title="Overdue" items={p.overdueRevisions} icon={FolderClock} showComplete />
      <Group title="Due today" items={p.dueRevisions} icon={RotateCcw} showComplete />
      <Group title="Upcoming" items={p.upcomingRevisions} icon={Clock3} />
      <Group title="Completed" items={p.revisions.filter((r) => r.status === "Completed")} icon={CheckCircle2} />
    </div>
  );
}
