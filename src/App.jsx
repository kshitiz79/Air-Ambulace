import React from "react";
import {
  Routes,
  Route,
  Navigate // <-- ADD THIS LINE
} from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";






import CitizenDashboard from "./dashboard/Citizens/CitizenDashboard";
import Home from "./pages/Citizen/Home";
import EnquiryForm from "./pages/Citizen/EnquiryForm";
import StatusCheck from "./pages/Citizen/StatusCheck";
import EmergencyContact from "./pages/Citizen/EmergencyContact";
import NotificationPage from "./pages/Citizen/NotificationPage";
import DoxUpload from "./pages/Citizen/DoxUpload";
import FAQPage from "./pages/Citizen/FAQPage";

import CmhoDashboard from "./dashboard/CMHOPanel/CmhoDashboard";
import EnquiryCreationPage from "./pages/CMHO/EnquiryCreationPage";


import Dashboard from "./pages/CMHO/Dashboard";



import SDMPanel from "./dashboard/SDMPanel/SDMPanel";
import SDMDashboard from "./pages/SDM/SDMDashboard";

import EnquiryDetailsPage from "./pages/SDM/EnquiryDetailsPage";
import QueryToCMHOPage from "./pages/SDM/QueryToCMHOPage";
import ValidationPage from "./pages/SDM/ValidationPage";
import SearchPage from "./pages/SDM/SearchPage";
import ResponseFromCMHO from "./pages/SDM/ResponseFromCMHO";




import DmPanel from "./dashboard/DMPanel/DmPanel";
import CollectorDashboard from "./pages/DM/CollectorDashboard";
import ApprovalANDRejectionPage from "./pages/DM/ApprovalANDRejectionPage";
import CaseFileViewPage from "./pages/DM/CaseFileViewPage";
import EscalationPage from "./pages/DM/EscalationPage";
import FinancialSanctionPage from "./pages/DM/FinancialSanctionPage";
import OrderReleasePage from "./pages/DM/OrderReleasePage";
import CollectorSearchPage from "./pages/DM/CollectorSearchPage";

import AirRequirementTeam from "./dashboard/AirRequirementTeam/AirRequirementTeam";
import AirDashboard from "./pages/AirRequirementTeam/Dashboard";
import AmbulanceAssignmentPage from "./pages/AirRequirementTeam/AmbulanceAssignmentPage";
import CaseDetailPage from "./pages/AirRequirementTeam/CaseDetailPage";
import PostOperationPage from "./pages/AirRequirementTeam/PostOperationPage";
import TrackerPage from "./pages/AirRequirementTeam/TrackerPage";
import InvoiceGenerationPage from "./pages/AirRequirementTeam/InvoiceGenerationPage";
import CaseCloseFile from "./pages/AirRequirementTeam/CaseCloseFile";
import AirTeamProfile from "./pages/AirRequirementTeam/Profile";

import AdminPanel from "./dashboard/AdminPanel/AdminPanel";
import AdminDashboard from "./pages/AdminPanel/AdminDashboard";
import AdminReportsPage from "./pages/AdminPanel/AdminReportsPage";
import AlertsPage from "./pages/AdminPanel/AlertsPage";
import DistrictDataPage from "./pages/AdminPanel/DistrictDataPage";
import ExportPage from "./pages/AdminPanel/ExportPage";
import PermissionsManagementPage from "./pages/AdminPanel/PermissionsManagementPage";
import SystemPerformancePage from "./pages/AdminPanel/SystemPerformancePage";
import UserManagementPage from "./pages/AdminPanel/UserManagementPage";
import EnquiryManagementPage from "./pages/AdminPanel/EnquiryManagementPage";
import AllQueryPage from "./pages/AdminPanel/AllQueryPage";


import EnquiryListPage from "./pages/SDM/EnquiryListPage";


import CaseFileListPage from "./pages/DM/CaseFileListPage";

import Login from "./pages/Auth/Login";
// import HomePage from "./pages/HomePage";
import Signup from "./pages/Auth/Signup";
import CreateHospital from "./pages/AdminPanel/Hospital";
import BeneficiaryEditPageList from "./pages/CMHO/BeneficiaryEditPageList";
import BeneficiaryDetailsEditPage from "./pages/CMHO/BeneficiaryDetailsEditPage";
import BeneficiaryDetailPage from "./pages/CMHO/BeneficiaryDetailPage";
import EscalateCase from "./pages/CMHO/EscalateCase";
import Notification from "./pages/CMHO/Notification";
import Profile from "./pages/CMHO/Profile";
import QueryFromSDM from "./pages/CMHO/QueryFromSDM";
import QueryFromCollector from "./pages/CMHO/QueryFromCollector";
import SDMProfile from "./pages/SDM/Profile";
import DMProfile from "./pages/DM/Profile";
import CollectorQueryToCmhoPage from "./pages/DM/CollectorQueryToCmhoPage";

// DME Dashboard imports
import DmePanel from "./dashboard/DMEPanel/DmePanel";
import DMEDashboard from "./pages/DME/DMEDashboard";
import DMEApprovalRejection from "./pages/DME/DMEApprovalRejection";
import DMECaseFileList from "./pages/DME/DMECaseFileList";
import DMECaseFileView from "./pages/DME/DMECaseFileView";
import DMEEscalation from "./pages/DME/DMEEscalation";
import DMEFinancialSanction from "./pages/DME/DMEFinancialSanction";
import DMEOrderRelease from "./pages/DME/DMEOrderRelease";
import DMESearch from "./pages/DME/DMESearch";
import DMEProfile from "./pages/DME/DMEProfile";
import DMEQueryToCMHO from "./pages/DME/DMEQueryToCMHO";

// IT Team Dashboard imports
import ITTeamDashboard from "./dashboard/ITTeam/ITTeamDashboard";
import ITDashboard from "./pages/ITTeam/Dasboard";
import AllUsers from "./pages/ITTeam/AllUsers";
import SystemLogs from "./pages/ITTeam/SystemLogs";
import DatabaseManagement from "./pages/ITTeam/DatabaseManagement";
import SecurityCenter from "./pages/ITTeam/SecurityCenter";
import SystemSettings from "./pages/ITTeam/SystemSettings";
import DistrictManagement from "./pages/ITTeam/DistrictManagement";
import HospitalManagement from "./pages/ITTeam/HospitalManagement";
import ITAmbulanceManagement from "./pages/AirRequirementTeam/AmbulanceManagementPage";
import EnquiryManagement from "./pages/ITTeam/EnquiryManagement";
import FlightAssignments from "./pages/ITTeam/FlightAssignments";
import DataImportExport from "./pages/ITTeam/DataImportExport";
import AnalyticsReports from "./pages/ITTeam/AnalyticsReports";

import AmbulanceManagementPage from "./pages/AirRequirementTeam/AmbulanceManagementPage";
import HomePage from "./pages/HomePage";
import { isTokenExpired } from "./utils/authUtils";
import ScriptWarningToast from "./components/Common/ScriptWarningToast";
import EmergencyContactFloat from "./components/Common/EmergencyContactFloat";


function App() {
  const PrivateRoute = ({ children, roleRequired }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('PrivateRoute check:', { token: !!token, role, roleRequired, pathname: window.location.pathname });

    if (!token) {
      console.log('Redirecting to /sign-in: No token');
      return <Navigate to="/sign-in" />;
    }

    if (isTokenExpired(token)) {
      console.log('Redirecting to /sign-in: Token expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      return <Navigate to="/sign-in?expired=true" />;
    }

    if (roleRequired && role !== roleRequired) {
      console.log(`Redirecting to /: Role mismatch (stored: ${role}, required: ${roleRequired})`);
      return <Navigate to="/" />;
    }

    return children;
  };





  return (
    <ThemeProvider>
      <LanguageProvider>
      <ScriptWarningToast />
      <EmergencyContactFloat />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/user" element={<PrivateRoute roleRequired="BENEFICIARY"><CitizenDashboard /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="enquiry-form" element={<EnquiryForm />} />
          <Route path="status-check" element={<StatusCheck />} />
          <Route path="dox-upload" element={<DoxUpload />} />
          <Route path="emergency-contact" element={<EmergencyContact />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="faq-page" element={<FAQPage />} />
        </Route>



        <Route path="/cmho-dashboard" element={<PrivateRoute roleRequired="CMHO"><CmhoDashboard /></PrivateRoute>}>
          <Route index element={<Dashboard />} />

          <Route path="beneficiary-detail-page" element={<BeneficiaryEditPageList />} />
          <Route path="beneficiary-detail-page/:id" element={<BeneficiaryDetailsEditPage />} /> {/* Relative path */}
          <Route path="enquiry-creation-page" element={<EnquiryCreationPage />} />

          <Route path="escalate-case" element={<EscalateCase />} />
          {/* <Route path="query-from-sdm" element={<QueryFromSDM />} /> */}
          <Route path="query-from-collector" element={<QueryFromCollector />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Standalone CMHO routes */}
        <Route path="/beneficiary-detail/:id" element={<PrivateRoute roleRequired="CMHO"><BeneficiaryDetailPage /></PrivateRoute>} />
        <Route path="/beneficiary-edit/:id" element={<PrivateRoute roleRequired="CMHO"><BeneficiaryDetailsEditPage /></PrivateRoute>} />





        <Route path="/sdm-dashboard" element={<PrivateRoute roleRequired="SDM"><SDMPanel /></PrivateRoute>}>
          <Route index element={<SDMDashboard />} />

          <Route path="response-from-cmho" element={<ResponseFromCMHO />} />
          <Route path="enquiry-detail-page/query-to-cmho/:enquiryId" element={<QueryToCMHOPage />} />
          <Route path="enquiry-detail-page" element={<EnquiryListPage />} />
          <Route path="enquiry-detail-page/:enquiryId" element={<EnquiryDetailsPage />} />
          <Route path="search-page" element={<SearchPage />} />
          <Route path="validation-page" element={<ValidationPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="profile" element={<SDMProfile />} />
        </Route>





        <Route path="/collector-dashboard" element={<PrivateRoute roleRequired="COLLECTOR"><DmPanel /></PrivateRoute>}>
          <Route index element={<CollectorDashboard />} />
          <Route path="approval-reject" element={<ApprovalANDRejectionPage />} />
          <Route path="case-file/:enquiryId" element={<CaseFileViewPage />} />
          <Route path="query-to-cmho/:enquiryId" element={<CollectorQueryToCmhoPage />} />
          <Route path="case-files" element={<CaseFileListPage />} />
          <Route path="escalation-page" element={<EscalationPage />} />
          <Route path="financial-page" element={<FinancialSanctionPage />} />
          <Route path="order-release-page" element={<OrderReleasePage />} />
          <Route path="search-page" element={<CollectorSearchPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="profile" element={<DMProfile />} />
        </Route>

        <Route path="/admin" element={<PrivateRoute roleRequired="ADMIN"><AdminPanel /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="admin-report-page" element={<AdminReportsPage />} />
          <Route path="alert-page" element={<AlertsPage />} />
          <Route path="district-data-page" element={<DistrictDataPage />} />
          <Route path="export-page" element={<ExportPage />} />
          <Route path="permission-page" element={<PermissionsManagementPage />} />
          <Route path="system-performance-page" element={<SystemPerformancePage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="enquiry-management" element={<EnquiryManagementPage />} />
          <Route path="hospital-management" element={<CreateHospital />} />
          <Route path="all-queries" element={<AllQueryPage />} />
          <Route path="notification" element={<NotificationPage />} />
        </Route>

        <Route path="/air-team" element={<PrivateRoute roleRequired="SERVICE_PROVIDER"><AirRequirementTeam /></PrivateRoute>}>
          <Route index element={<AirDashboard />} />
          <Route path="ambulance-management-page" element={<AmbulanceManagementPage />} />
          <Route path="ambulance-assignment-page" element={<AmbulanceAssignmentPage />} />
          <Route path="case-detail-page" element={<CaseDetailPage />} />
          <Route path="post-operation-page" element={<PostOperationPage />} />
          <Route path="tracker-page" element={<TrackerPage />} />
          <Route path="invoice-generation-page" element={<InvoiceGenerationPage />} />
          <Route path="case-close-file" element={<CaseCloseFile />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="profile" element={<AirTeamProfile />} />
        </Route>

        <Route path="/dme-dashboard" element={<PrivateRoute roleRequired="DME"><DmePanel /></PrivateRoute>}>
          <Route index element={<DMEDashboard />} />
          <Route path="approval-reject" element={<DMEApprovalRejection />} />
          <Route path="case-files" element={<DMECaseFileList />} />
          <Route path="case-file/:enquiryId" element={<DMECaseFileView />} />
          <Route path="escalation-page" element={<DMEEscalation />} />
          <Route path="financial-page" element={<DMEFinancialSanction />} />
          <Route path="financial-page/:enquiryId" element={<DMEFinancialSanction />} />
          <Route path="order-release-page" element={<DMEOrderRelease />} />
          <Route path="order-release-page/:enquiryId" element={<DMEOrderRelease />} />
          <Route path="search-page" element={<DMESearch />} />
          <Route path="profile" element={<DMEProfile />} />
          <Route path="query-to-cmho/:enquiryId" element={<DMEQueryToCMHO />} />
          <Route path="notification" element={<NotificationPage />} />
        </Route>

        <Route path="/it-team" element={<PrivateRoute roleRequired="SUPPORT"><ITTeamDashboard /></PrivateRoute>}>
          <Route index element={<ITDashboard />} />

          {/* User & System Management */}
          <Route path="all-users" element={<AllUsers />} />
          <Route path="system-logs" element={<SystemLogs />} />
          <Route path="database-management" element={<DatabaseManagement />} />
          <Route path="security-center" element={<SecurityCenter />} />
          <Route path="system-settings" element={<SystemSettings />} />

          {/* Data Management */}
          <Route path="district-management" element={<DistrictManagement />} />
          <Route path="hospital-management" element={<HospitalManagement />} />
          <Route path="ambulance-management" element={<ITAmbulanceManagement />} />

          {/* Operations Management */}
          <Route path="enquiry-management" element={<EnquiryManagement />} />
          <Route path="flight-assignments" element={<FlightAssignments />} />
          <Route path="invoices-management" element={<InvoiceGenerationPage />} />
          <Route path="case-escalations" element={<EscalationPage />} />
          <Route path="post-operations" element={<PostOperationPage />} />

          {/* Import/Export & Analytics */}
          <Route path="data-import-export" element={<DataImportExport />} />
          <Route path="analytics-reports" element={<AnalyticsReports />} />
          <Route path="advanced-search" element={<SearchPage />} />
          <Route path="notification" element={<NotificationPage />} />
        </Route>

      </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
