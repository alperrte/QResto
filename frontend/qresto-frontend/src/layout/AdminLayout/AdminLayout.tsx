import { Outlet } from "react-router-dom";
import MainSidebar from "../../components/sidebar/MainSidebar";
import PanelHeader from "../../components/layout/PanelHeader";

function AdminLayout() {
    return (
        <div className="min-h-screen bg-[var(--qresto-bg)] text-[var(--qresto-text)] transition-colors duration-300">
            <div className="flex min-h-screen">
                <MainSidebar />

                <div className="flex min-w-0 flex-1 flex-col border-l border-[var(--qresto-border-strong)]">
                    <PanelHeader />

                    <main className="flex-1 min-w-0 px-8 py-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;