export default function TransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage platform transactions</p>
      </div>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">Transactions page is under development</p>
        </div>
      </div>
    </div>
  );
}