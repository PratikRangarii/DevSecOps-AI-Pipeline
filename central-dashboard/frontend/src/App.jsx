import { Route, Routes } from "react-router";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import PipelinePage from "./pages/PipelinePage";
import SecurityPage from "./pages/SecurityPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import AIAnalysisPage from "./pages/AIAnalysisPage";
import DeploymentsPage from "./pages/DeploymentsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route
          index
          element={<DashboardPage />}
        />

        <Route
          path="/pipeline"
          element={<PipelinePage />}
        />

        <Route
          path="/security"
          element={<SecurityPage />}
        />

        <Route
          path="/ai-analysis"
          element={<AIAnalysisPage />
          }
        />

        <Route
          path="/deployments"
          element={<DeploymentsPage />
          }
        />

        <Route
          path="/applications"
          element={<ApplicationsPage />
          }
        />

        <Route
          path="reports"
          element={<ReportsPage />
          }
        />

        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="Settings"
              description="Dashboard endpoints, theme and integration configuration."
            />
          }
        />

        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Page Not Found"
              description="The requested dashboard page does not exist."
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
