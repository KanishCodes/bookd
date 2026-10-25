import React, { useState, useEffect } from 'react';
import { getReportsSummary } from '../api/reports.api.js';
import { LoadingState, ErrorState } from '../components/FeedbackStates.jsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Banknote,
  BookOpen,
  Users,
  Download,
  Calendar
} from 'lucide-react';

const COLORS = [
  '#16587B', // Venice Blue
  '#84B3CE', // Rock Blue
  '#2E6F40', // Sage
  '#C84B31', // Warm Red
  '#9B6B43', // Warm Earth
  '#5B4B70', // Deep Plum
  '#4A6572'  // Muted Ink
];

export const AdminReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getReportsSummary();
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating circulation metrics and analytics..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'No report data available'} />;
  }

  const { summary, mostIssuedBooks, monthlyCirculation, categoryDistribution, overdueMembers } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-sand flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest small-caps font-sans font-medium text-ink-muted">
            Institutional Governance & Archival Health
          </span>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-venice-blue stroke-[1.5]" />
            <span>Circulation & Analytics Reports</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Real-time telemetry on book usage, loan velocity, overdue liabilities, and collection distribution.
          </p>
        </div>

        <button
          onClick={() => alert('Simulated: Report exported to CSV.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-sand bg-merino-light hover:bg-sand text-venice-blue rounded text-xs uppercase small-caps font-semibold tracking-wider transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="paper-card rounded-md p-4">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs small-caps uppercase font-semibold">Total Stock</span>
            <BookOpen className="w-4 h-4 text-venice-blue" />
          </div>
          <div className="font-serif text-2xl font-bold text-ink">
            {summary.totalCopies} <span className="text-xs font-sans text-ink-muted font-normal">copies</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Across {summary.totalBooks} distinct catalogued titles
          </div>
        </div>

        <div className="paper-card rounded-md p-4">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs small-caps uppercase font-semibold">Active Loans</span>
            <TrendingUp className="w-4 h-4 text-rock-blue" />
          </div>
          <div className="font-serif text-2xl font-bold text-venice-blue">
            {summary.activeLoans} <span className="text-xs font-sans text-ink-muted font-normal">volumes</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Active circulation in patron hands
          </div>
        </div>

        <div className="paper-card rounded-md p-4">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs small-caps uppercase font-semibold">Overdue Breaches</span>
            <AlertCircle className="w-4 h-4 text-warm-red" />
          </div>
          <div className="font-serif text-2xl font-bold text-warm-red">
            {summary.overdueLoans} <span className="text-xs font-sans text-ink-muted font-normal">patrons</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Pending penalties: ₹{summary.pendingFines}
          </div>
        </div>

        <div className="paper-card rounded-md p-4">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-xs small-caps uppercase font-semibold">Total Fines Settled</span>
            <Banknote className="w-4 h-4 text-sage" />
          </div>
          <div className="font-serif text-2xl font-bold text-ink">
            ₹{summary.totalFinesCollected}
          </div>
          <div className="text-[11px] text-ink-muted mt-0.5">
            Credited to Library Acquisition Fund
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Most-Issued Books Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 paper-card rounded-md p-5 border border-sand">
          <div className="pb-3 border-b border-sand mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-bold text-ink">
                Highest Circulation Titles (Lifetime Issues)
              </h2>
              <p className="text-xs text-ink-muted">
                Volumes with the highest checkout demand across semesters.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-sand/40 rounded text-venice-blue">
              Top 8 Titles
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mostIssuedBooks}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis type="number" stroke="#4A6572" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="title"
                  stroke="#4A6572"
                  fontSize={11}
                  width={140}
                  tickFormatter={(val) => (val.length > 20 ? `${val.slice(0, 18)}…` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF6ED',
                    border: '1px solid #E4DAC5',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="issues" name="Times Issued" fill="#16587B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 paper-card rounded-md p-5 border border-sand">
          <div className="pb-3 border-b border-sand mb-4">
            <h2 className="font-serif text-base font-bold text-ink">
              Catalogue by Discipline
            </h2>
            <p className="text-xs text-ink-muted">
              Holdings distribution across core curricular divisions.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF6ED',
                    border: '1px solid #E4DAC5',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  formatter={(value, name, item) => [`${value} titles (${item.payload.loans} loans)`, item.payload.name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Circulation Trend Line/Area Chart (12 Cols) */}
        <div className="lg:col-span-12 paper-card rounded-md p-5 border border-sand">
          <div className="pb-3 border-b border-sand mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-bold text-ink">
                Monthly Circulation Velocity (Issues vs. Returns)
              </h2>
              <p className="text-xs text-ink-muted">
                Transaction turnover tracking stack flow and desk throughput.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-venice-blue" /> Issues
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rock-blue" /> Returns
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyCirculation}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16587B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16587B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84B3CE" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#84B3CE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#4A6572" fontSize={11} />
                <YAxis stroke="#4A6572" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF6ED',
                    border: '1px solid #E4DAC5',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="issues"
                  stroke="#16587B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIssues)"
                  name="Volumes Issued"
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#84B3CE"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReturns)"
                  name="Volumes Returned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overdue Liabilities Table */}
      <div className="mt-10">
        <div className="pb-3 border-b border-sand flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink">
              Overdue Patron Ledger
            </h2>
            <p className="text-xs text-ink-muted">
              Patrons whose borrowing window has elapsed without desk return.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-warm-red/10 border border-warm-red/25 text-warm-red font-medium">
            {overdueMembers?.length || 0} Delinquent Loans
          </span>
        </div>

        <div className="mt-4 paper-card rounded-md overflow-hidden border border-sand">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-sand/30 border-b border-sand font-sans small-caps uppercase tracking-wider text-ink-muted">
                  <th className="py-2.5 px-4">Patron Name</th>
                  <th className="py-2.5 px-4">Member Card</th>
                  <th className="py-2.5 px-4">Volume on Loan</th>
                  <th className="py-2.5 px-4">Elapsed Days</th>
                  <th className="py-2.5 px-4">Accrued Penalty</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                {overdueMembers?.map((m, idx) => (
                  <tr key={idx} className="hover:bg-sand/15 transition">
                    <td className="py-2.5 px-4 font-semibold text-ink">
                      {m.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-ink-muted">
                      {m.memberId}
                    </td>
                    <td className="py-2.5 px-4 font-serif text-venice-blue">
                      {m.book}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-warm-red">
                      +{m.overdueDays} days
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-warm-red">
                      ₹{m.fine}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Notice reminder dispatched to ${m.name}.`)}
                        className="px-2.5 py-1 text-[11px] rounded bg-merino-light border border-sand hover:bg-sand text-ink transition"
                      >
                        Send Notice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
