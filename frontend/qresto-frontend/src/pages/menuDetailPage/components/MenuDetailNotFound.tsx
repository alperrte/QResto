import { Link } from "react-router-dom";

const MenuDetailNotFound = () => {
    return (
        <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 px-container-margin">
            <div className="menu-detail-not-found-card max-w-md w-full bg-surface-container-lowest rounded-xl p-8 text-center border border-outline-variant/20">
                <p className="font-sans text-body-lg text-on-surface mb-6">Bu ürün bulunamadı.</p>
                <Link
                    to="/menu"
                    className="inline-block rounded-full bg-primary-container text-on-primary-container font-sans text-label-bold py-3 px-8 hover:opacity-90 transition-opacity"
                >
                    Menüye dön
                </Link>
            </div>
        </div>
    );
};

export default MenuDetailNotFound;
