import { Route } from "react-router-dom";
import WelcomePage from "../../pages/welcome/WelcomePage";
import MenuPage from "../../pages/menuPage/MenuPage";
import MenuDetailPage from "../../pages/menuDetailPage/MenuDetailPage";

export const guestRoutes = [
    <Route key="welcome" path="/welcome" element={<WelcomePage />} />,
    <Route key="menu" path="/menu" element={<MenuPage />} />,
    <Route key="menu-detail" path="/menu/:itemId" element={<MenuDetailPage />} />,
];
