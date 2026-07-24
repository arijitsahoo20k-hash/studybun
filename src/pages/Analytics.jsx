import React from "react";
import { TrendingUp, Library } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { Card, SectionTitle } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";

export default function AnalyticsPage(p) {
  const radarData = Object.keys(SYLLABUS).map((s) => {
    const chs = Object.values(SYLLABUS[s].groups).flat();
    const done = chs.filter((c) => ["Completed", "Mastered"].includes(p.getChStatus(`${s}::${c}`).status)).length;
    return { subject: s, completion: Math.round((done / chs.length) * 100) };
  });

  return (
    <div className="sb-page">
      <div className="sb-grid-2">
        <Card>
          <SectionTitle icon={TrendingUp}>Weekly study hours</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={p.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Line type="monotone" dataKey="hours" stroke="var(--accent)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionTitle icon={Library}>Syllabus completion by subject</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--soft)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--muted)" fontSize={12} />
              <Radar dataKey="completion" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="sb-grid-3">
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.overallPct.toFixed(0)}%</div><div className="sb-muted">Overall completion</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.totalQuestions}</div><div className="sb-muted">Lifetime questions</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.mocks.length}</div><div className="sb-muted">Mocks attempted</div></div></Card>
      </div>
    </div>
  );
}
