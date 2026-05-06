const MenuPage = () => {
    const tableNo = localStorage.getItem("tableNo");
    const tableName = localStorage.getItem("tableName");
    const tableSessionId = localStorage.getItem("tableSessionId");
    const guestSessionId = localStorage.getItem("guestSessionId");

    return (
        <div className="min-h-screen bg-[#1F1713] text-[#FFF7ED] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#FFF3E0] text-[#3B2418] rounded-3xl p-6 text-center shadow-xl">
                <h1 className="text-3xl font-bold mb-3">QResto Menü</h1>

                <p className="text-lg font-semibold text-[#F97316]">
                    Menü burada olacak.
                </p>

                <div className="mt-6 text-left space-y-2 text-sm">
                    <p><strong>Masa No:</strong> {tableNo}</p>
                    <p><strong>Masa Adı:</strong> {tableName}</p>
                    <p><strong>Table Session ID:</strong> {tableSessionId}</p>
                    <p><strong>Guest Session ID:</strong> {guestSessionId}</p>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;