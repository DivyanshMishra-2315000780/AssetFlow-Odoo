import { BarChart3, Download, TrendingUp, TrendingDown, PieChart, Activity } from "lucide-react";

function MetricCard({ title, value, trend, trendValue, icon: Icon, color }: any) {
  return (
    <div className="bg-white border-2 border-border rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-full border-2 border-border ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border-2 ${trend === 'up' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-muted-foreground">{title}</p>
        <p className="text-3xl font-black text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground">Reports & Analytics</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Asset utilization trends, lifecycle tracking, and depreciation data.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border-2 border-border text-foreground px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
            <Download className="w-4 h-4 stroke-[3]" /> PDF
          </button>
          <button className="flex items-center gap-2 bg-primary border-2 border-border text-foreground px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
            <Download className="w-4 h-4 stroke-[3]" /> CSV
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Avg Utilization Rate" value="78%" trend="up" trendValue="+4.2%" icon={Activity} color="bg-accent" />
        <MetricCard title="Maintenance Frequency" value="12/mo" trend="down" trendValue="-2.1%" icon={BarChart3} color="bg-[#ffc8a2]" />
        <MetricCard title="Total Depreciation" value="$42,500" trend="up" trendValue="+1.5%" icon={TrendingDown} color="bg-[#f7baba]" />
        <MetricCard title="Audit Compliance" value="99.2%" trend="up" trendValue="+0.8%" icon={PieChart} color="bg-[#b4f0b4]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mock Chart 1 */}
        <div className="bg-white border-2 border-border rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
          <h3 className="font-black text-lg mb-6">Asset Allocation by Department</h3>
          <div className="space-y-4">
            {[
              { label: 'Information Technology', value: 45, color: 'bg-primary' },
              { label: 'Operations', value: 25, color: 'bg-accent' },
              { label: 'Marketing', value: 15, color: 'bg-[#ffc8a2]' },
              { label: 'Finance', value: 10, color: 'bg-[#d5c5ff]' },
              { label: 'HR', value: 5, color: 'bg-[#b4f0b4]' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span>{stat.label}</span>
                  <span>{stat.value}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 border border-border overflow-hidden">
                  <div className={`h-full ${stat.color} border-r border-border`} style={{ width: `${stat.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Chart 2 */}
        <div className="bg-white border-2 border-border rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg mb-2">Maintenance Spend Trend</h3>
            <p className="text-sm font-medium text-muted-foreground mb-8">Trailing 6 months cost analysis</p>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-48 mt-auto px-4">
            {[
              { month: 'May', height: '40%' },
              { month: 'Jun', height: '55%' },
              { month: 'Jul', height: '30%' },
              { month: 'Aug', height: '80%' },
              { month: 'Sep', height: '45%' },
              { month: 'Oct', height: '60%' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full group">
                <div className="w-full bg-secondary border-2 border-border rounded-t-xl group-hover:bg-primary transition-colors" style={{ height: bar.height }}></div>
                <span className="text-xs font-bold text-muted-foreground">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
