import { AlertCircle } from "lucide-react";

import DashboardKpiCards from "./components/DashboardKpiCards";
import DashboardPaymentDistribution from "./components/DashboardPaymentDistribution";
import DashboardProductSalesTable from "./components/DashboardProductSalesTable";
import DashboardReportToolbar from "./components/DashboardReportToolbar";
import DashboardTopProducts from "./components/DashboardTopProducts";
import { useDashboardReport } from "./hooks/useDashboardReport";

import "./styles/dashboardPage.css";

function DashboardPage() {
    const {
        summary,
        ratingSummary,
        productRatingSummary,
        topProducts,
        productSales,
        loading,
        error,
        refresh,
    } = useDashboardReport();

    return (
        <div className="dashboard-page space-y-8 pb-4">
            <DashboardReportToolbar onRefresh={refresh} loading={loading} />

            {error ? (
                <div
                    className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                    role="alert"
                >
                    <AlertCircle className="mt-0.5 shrink-0" size={18} />
                    <span>{error}</span>
                </div>
            ) : null}

            <DashboardKpiCards
                summary={summary}
                ratingSummary={ratingSummary}
                productRatingSummary={productRatingSummary}
                loading={loading}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DashboardPaymentDistribution totalOrders={summary.totalOrderCount} />
                <DashboardTopProducts items={topProducts} loading={loading} />
            </div>

            <DashboardProductSalesTable rows={productSales} loading={loading} />
        </div>
    );
}

export default DashboardPage;
