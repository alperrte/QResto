import { BrowserRouter } from "react-router-dom";
import QrRoutes from "./routes/qr/qrRoutes";

function App() {
  return (
      <BrowserRouter>
        <QrRoutes />
      </BrowserRouter>
  );
}

export default App;