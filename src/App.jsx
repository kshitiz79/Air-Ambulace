import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate // <-- ADD THIS LINE
} from "react-router-dom";


import CitizenDashboard from "./dashboard/Citizens/CitizenDashboard";
import Home from "./pages/Citizen/Home";
import EnquiryForm from "./pages/Citizen/EnquiryForm";
import StatusCheck from "./pages/Citizen/StatusCheck";
import EmergencyContact from "./pages/Citizen/EmergencyContact";
import NotificationPage from "./pages/Citizen/NotificationPage";
import DoxUpload from "./pages/Citizen/DoxUpload";
import FAQPage from "./pages/Citizen/FAQPage";

import CmoDashboard from "./dashboard/CMOPanel/CmoDashboard";
import EnquiryCreationPage from "./pages/CMO/EnquiryCreationPage";
import DocumentVerificationPage from "./pages/CMO/DocumentVerificationPage";
import CaseStatusPage from "./pages/CMO/CaseStatusPage";
import Dashboard from "./pages/CMO/Dashboard";
import CaseForwardingPage from "./pages/CMO/CaseForwardingPage";
import BeneficiaryDetailsEditPage from "./pages/CMO/BeneficiaryDetailsEditPage";

import SDMPanel from "./dashboard/SDMPanel/SDMPanel";
import SDMDashboard from "./pages/SDM/SDMDashboard";
import ForwardToDMPage from "./pages/SDM/ForwardToDMPage";
import ApproveRejectPage from "./pages/SDM/ApproveRejectPage";
import EnquiryDetailsPage from "./pages/SDM/EnquiryDetailsPage";
import QueryToCMOPage from "./pages/SDM/QueryToCMOPage";
import ValidationPage from "./pages/SDM/ValidationPage";
import SearchPage from "./pages/SDM/SearchPage";

import DmPanel from "./dashboard/DMPanel/DmPanel";
import DMDashboard from "./pages/DM/DmDashboard";
import ApprovalANDRejectionPage from "./pages/DM/ApprovalANDRejectionPage";
import CaseFileViewPage from "./pages/DM/CaseFileViewPage";
import EscalationPage from "./pages/DM/EscalationPage";
import FinancialSanctionPage from "./pages/DM/FinancialSanctionPage";
import OrderReleasePage from "./pages/DM/OrderReleasePage";
import DMSearchPage from "./pages/DM/DMSearchPage";

import AirRequirementTeam from "./dashboard/AirRequirementTeam/AirRequirementTeam";
import AirDashboard from "./pages/AirRequirement/AirDashboard";
import AmbulanceAssignmentPage from "./pages/AirRequirement/AmbulanceAssignmentPage";
import CaseClosurePage from "./pages/AirRequirement/CaseClosurePage";
import CaseDetailsPage from "./pages/AirRequirement/CaseDetailsPage";
import InvoiceGenerationPage from "./pages/AirRequirement/InvoiceGenerationPage";
import PostOperationReportPage from "./pages/AirRequirement/PostOperationReportPage";
import TrackerPage from "./pages/AirRequirement/TrackerPage";

import AdminPanel from "./dashboard/AdminPanel/AdminPanel";
import AdminDashboard from "./pages/AdminPanel/AdminDashboard";
import AdminReportsPage from "./pages/AdminPanel/AdminReportsPage";
import AlertsPage from "./pages/AdminPanel/AlertsPage";
import DistrictDataPage from "./pages/AdminPanel/DistrictDataPage";
import ExportPage from "./pages/AdminPanel/ExportPage";
import PermissionsManagementPage from "./pages/AdminPanel/PermissionsManagementPage";
import SystemPerformancePage from "./pages/AdminPanel/SystemPerformancePage";
import UserManagementPage from "./pages/AdminPanel/UserManagementPage";


import EnquiryListPage from "./pages/SDM/EnquiryListPage";


import CaseFileListPage from "./pages/DM/CaseFileListPage";
import CaseListPage from "./pages/AirRequirement/CaseListPage";
import Login from "./pages/Auth/Login";
import HomePage from "./pages/HomePage";
import Signup from "./pages/Auth/Signup";

function App() {


  const role = localStorage.getItem('role');  // Get role from localStorage

  // Private Route logic to protect dashboard pages
  const PrivateRoute = ({ children, roleRequired }) => {
    if (!localStorage.getItem('token')) {
      return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    if (role && role !== roleRequired) {
      return <Navigate to="/" />;  // Redirect to home if role mismatch
    }

    return children;
  };









  return (
    <Router>
      <Routes>



                <Route path="/" element={<HomePage />} />

                <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />


        <Route path="/user" element={ <PrivateRoute roleRequired="BENEFICIARY">
            <CitizenDashboard />
          </PrivateRoute>}>

        
          <Route index element={<Home />} />
          <Route path="enquiry-form" element={<EnquiryForm />} />
          <Route path="status-check" element={<StatusCheck />} />
          <Route path="dox-upload" element={<DoxUpload />} />
          <Route path="emergency-contact" element={<EmergencyContact />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="faq-page" element={<FAQPage />} />
        </Route>









        <Route path="/cmo-dashboard" element={ <PrivateRoute roleRequired="CMO">
            <CmoDashboard />
          </PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="forwarding-form" element={<CaseForwardingPage />} />
          <Route
            path="beneficiary-detail-page"
            element={<BeneficiaryDetailsEditPage />}
          />
          <Route path="cmo-dox-upload" element={<DoxUpload />} />
          <Route
            path="enquiry-creation-page"
            element={<EnquiryCreationPage />}
          />
          <Route
            path="document-verification"
            element={<DocumentVerificationPage />}
          />
          <Route path="case-status-page" element={<CaseStatusPage />} />
        </Route>







        <Route path="/sdm-dashboard" element={<PrivateRoute roleRequired="SDM">
            <SDMPanel />
          </PrivateRoute>}>
          <Route index element={<SDMDashboard />} />
          <Route path="forwarding-to-dm" element={<ForwardToDMPage />} />
          <Route path="approval-reject" element={<ApproveRejectPage />} />
          <Route path="query-to-cmo" element={<QueryToCMOPage />} />
           <Route path="enquiry-detail-page" element={<EnquiryListPage />} />
        <Route path="enquiry-detail-page/:enquiryId" element={<EnquiryDetailsPage />} />

          <Route path="search-page" element={<SearchPage />} />
          <Route path="validation-page" element={<ValidationPage />} />
        </Route>






        <Route path="/dm-dashboard" element={   <PrivateRoute roleRequired="DM" > <DmPanel /></PrivateRoute>  }>
          <Route index element={  <DMDashboard />} />
          <Route
            path="approval-reject"
            element={<ApprovalANDRejectionPage />}
          />
          <Route path="case-file/:enquiryId" element={<CaseFileViewPage />} />
           <Route path="case-files" element={<CaseFileListPage />} />
          <Route path="escalation-page" element={<EscalationPage />} />
          <Route path="financial-page" element={<FinancialSanctionPage />} />
          <Route path="order-release-page" element={<OrderReleasePage />} />
          <Route path="search-page" element={<DMSearchPage />} />
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
        </Route>

      <Route path="/air-team" element={<PrivateRoute roleRequired="SERVICE_PROVIDER"><AirRequirementTeam /></PrivateRoute>}>
          <Route index element={<AirDashboard />} />
          <Route path="ambulance-assignment-page" element={<AmbulanceAssignmentPage />} />
          <Route path="case-close-file" element={<CaseClosurePage />} />
          <Route path="case-detail-page" element={<CaseListPage />} />
          <Route path="case-details/:enquiryId" element={<CaseDetailsPage />} />
          <Route path="invoice-generation-page" element={<InvoiceGenerationPage />} />
          <Route path="post-operation-page" element={<PostOperationReportPage />} />
          <Route path="tracker-page" element={<TrackerPage />} />
        </Route>

 {/* <Route path="/it-team" element={<AirRequirementTeam />}>
          <Route index element={<AirDashboard />} />
          <Route
            path="ambulance-assignment-page"
            element={<AmbulanceAssignmentPage />}
          />
          <Route path="case-close-file" element={<CaseClosurePage />} />





   


          <Route
            path="invoice-generation-page"
            element={<InvoiceGenerationPage />}
          />
          <Route
            path="post-operation-page"
            element={<PostOperationReportPage />}
          />
          <Route path="tracker-page" element={<TrackerPage />} />
        </Route> */}




      </Routes>
    </Router>
  );
}

export default App;
