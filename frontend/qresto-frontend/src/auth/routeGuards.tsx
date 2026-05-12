import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { AuthRole } from "./auth.types";

const roleHomePathMap: Record<AuthRole, string> = {
    ADMIN: "/app/admin/dashboard",
    WAITER: "/app/waiter/dashboard",
    KITCHEN: "/app/kitchen/dashboard",
};

export const getRoleHomePath = (role: AuthRole) => roleHomePathMap[role];

export function RoleHomeRedirect() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to={getRoleHomePath(user.role)} replace />;
}

export function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export function RoleRoute({ allowedRoles }: { allowedRoles: AuthRole[] }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleHomePath(user.role)} replace />;
    }

    return <Outlet />;
}
