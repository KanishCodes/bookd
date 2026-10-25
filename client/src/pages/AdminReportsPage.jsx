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
      <div className="pb-6 border-b border-sand/70 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-muted">
            Institutional Governance & Archival Health
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-1 flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-venice-blue stroke-[2]" />
            <span>Circulation & Analytics Reports</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-medium">
            Real-time telemetry on book usage, loan velocity, overdue liabilities, and collection distribution.
          </p>
        </div>

        <button
          onClick={() => alert('Simulated: Report exported to CSV.')}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-sand bg-merino-light hover:bg-sand text-venice-blue rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Banner - Bento Pastel Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Yellow Bento Card: Total Stock */}
        <div className="bg-[#FEF8E7] border border-amber-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Stock</span>
            <div className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-950 tracking-tight mt-1">
            {summary.totalCopies} <span className="text-xs text-amber-800/80 font-medium">copies</span>
          </div>
          <div className="text-xs text-amber-800/80 mt-1 font-medium">
            Across {summary.totalBooks} catalogued titles
          </div>
        </div>

        {/* Sky Bento Card: Active Loans */}
        <div className="bg-[#F0F9FF] border border-sky-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between text-sky-900 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Loans</span>
            <div className="w-8 h-8 rounded-full bg-sky-200/80 text-sky-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-sky-950 tracking-tight mt-1">
            {summary.activeLoans} <span className="text-xs text-sky-800/80 font-medium">volumes</span>
          </div>
          <div className="text-xs text-sky-800/80 mt-1 font-medium">
            Active in patron circulation
          </div>
        </div>

        {/* Rose Bento Card: Overdue Breaches */}
        <div className="bg-[#FDF2F8] border border-pink-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between text-pink-900 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Breaches</span>
            <div className="w-8 h-8 rounded-full bg-pink-200/80 text-pink-900 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-warm-red tracking-tight mt-1">
            {summary.overdueLoans} <span className="text-xs text-pink-800/80 font-medium">patrons</span>
          </div>
          <div className="text-xs text-pink-800/80 mt-1 font-medium">
            Pending penalties: ₹{summary.pendingFines}
          </div>
        </div>

        {/* Mint Bento Card: Total Fines Settled */}
        <div className="bg-[#F0FDF4] border border-emerald-200/90 rounded-3xl p-5 shadow-bento hover:shadow-bento-hover transition-all">
          <div className="flex items-center justify-between text-emerald-900 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Fines Settled</span>
            <div className="w-8 h-8 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950 tracking-tight mt-1">
            ₹{summary.totalFinesCollected}
          </div>
          <div className="text-xs text-emerald-800/80 mt-1 font-medium">
            Acquisitions fund credit
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Most-Issued Books Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bento-card rounded-3xl p-6 border border-sand shadow-bento">
          <div className="pb-3.5 border-b border-sand/70 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">
                Highest Circulation Titles (Lifetime Issues)
              </h2>
              <p className="text-xs text-ink-muted font-medium mt-0.5">
                Volumes with the highest checkout demand across semesters.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-sand/60 rounded-full text-venice-blue">
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
        <div className="lg:col-span-5 bento-card rounded-3xl p-6 border border-sand shadow-bento">
          <div className="pb-3.5 border-b border-sand/70 mb-4">
            <h2 className="text-lg font-bold text-ink">
              Catalogue by Discipline
            </h2>
            <p className="text-xs text-ink-muted font-medium mt-0.5">
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
                    borderRadius: '16px',
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
        <div className="lg:col-span-12 bento-card rounded-3xl p-6 border border-sand shadow-bento">
          <div className="pb-3.5 border-b border-sand/70 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">
                Monthly Circulation Velocity (Issues vs. Returns)
              </h2>
              <p className="text-xs text-ink-muted font-medium mt-0.5">
                Transaction turnover tracking stack flow and desk throughput.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-ink-muted font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-venice-blue" /> Issues
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rock-blue" /> Returns
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
                    borderRadius: '16px',
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
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
              Overdue Patron Ledger
            </h2>
            <p className="text-xs text-ink-muted font-medium mt-0.5">
              Patrons whose borrowing window has elapsed without desk return.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-warm-red/10 border border-warm-red/25 text-warm-red font-bold">
            {overdueMembers?.length || 0} Delinquent Loans
          </span>
        </div>

        <div className="mt-4 bg-merino-light rounded-3xl overflow-hidden border border-sand shadow-bento">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-sand/40 border-b border-sand font-bold uppercase tracking-wider text-ink-muted">
                  <th className="py-3 px-4">Patron Name</th>
                  <th className="py-3 px-4">Member Card</th>
                  <th className="py-3 px-4">Volume on Loan</th>
                  <th className="py-3 px-4">Elapsed Days</th>
                  <th className="py-3 px-4">Accrued Penalty</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/50">
                {overdueMembers?.map((m, idx) => (
                  <tr key={idx} className="hover:bg-sand/20 transition">
                    <td className="py-3 px-4 font-bold text-ink">
                      {m.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-muted font-medium">
                      {m.memberId}
                    </td>
                    <td className="py-3 px-4 font-bold text-venice-blue">
                      {m.book}
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-warm-red">
                      +{m.overdueDays} days
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-warm-red">
                      ₹{m.fine}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Notice reminder dispatched to ${m.name}.`)}
                        className="px-3.5 py-1 text-[11px] rounded-full bg-merino-light border border-sand hover:bg-sand text-ink transition font-semibold"
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
