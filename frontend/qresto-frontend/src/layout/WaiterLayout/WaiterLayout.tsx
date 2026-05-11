import { Outlet } from "react-router-dom";
import MainSidebar from "../../components/sidebar/MainSidebar";

function WaiterLayout() {
    return (
        <div className="flex min-h-screen bg-[var(--qresto-bg)] text-[var(--qresto-text)]">
            <MainSidebar />

            <main className="min-h-screen flex-1 overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
}

export default WaiterLayout;