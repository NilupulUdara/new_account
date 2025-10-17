import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import { PermissionKeys } from "./views/Administration/SectionList";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";
import Maintenance from "./views/Sales/Maintenance/SalesMaintenance";
import InquiriesAndReports from "./views/Sales/InquiriesAndReports/SalesInquiriesAndReports";
import SalesQuotationEntry from "./views/Sales/Transactions/SalesQuotationEntry";
import SalesTransactions from "./views/Sales/Transactions/SalesTransactions";
import PurchaseTransactions from "./views/Purchases/Transactions/PurchaseTransactions";
import PurchaseInquiriesAndReports from "./views/Purchases/InquiriesAndReports/PurchaseInquiriesAndReports";
import PurchaseMaintenance from "./views/Purchases/Maintenance/PurchaseMaintenance";
import ItemsTransactions from "./views/ItemsAndInventory/Transactions/ItemsTransactions";
import ItemsInquiriesAndReports from "./views/ItemsAndInventory/InquiriesAndReports/ItemsInquiriesAndReports";
import ItemsMaintenance from "./views/ItemsAndInventory/Maintenance/ItemsMaintenance";
import ItemsPricingAndCosts from "./views/ItemsAndInventory/PricingAndCosts/PricingAndCosts";
import ManufacturingTransactions from "./views/Manufacturing/Transactions/ManufacturingTransactions";
import ManufacturingInquiriesAndReports from "./views/Manufacturing/InquiriesAndReports/ManufacturingInquiriesAndReports";
import ManufacturingMaintenance from "./views/Manufacturing/Maintenance/ManufacturingMaintenance";
import FixedAssestsTransactions from "./views/FixedAssets/Transactions/FixedAssestsTransactions";
import DimensionTransactions from "./views/Dimensions/Transactions/DimensionTransactions";
import DimensionInquiriesAndReports from "./views/Dimensions/InquiriesAndReports/DimensionInquiriesAndReports";
import DimensionMaintenance from "./views/Dimensions/Maintenance/DimensionMaintenance";
import BankingTransactions from "./views/BankindAndGeneralLedger/Transactions/BankingTransactions";
import BankingInquiriesAndReports from "./views/BankindAndGeneralLedger/InquiriesAndReports/BankingInquiriesAndReports";
import BankingMaintenance from "./views/BankindAndGeneralLedger/Maintenance/BankingMaintenance";
import SetupMaintenance from "./views/Setup/Maintenance/SetupMaintenance";
import Dashboard from "./views/Dashboard/Dashboard";
import CompanySetup from "./views/Setup/CompanySetup/CompanySetup";
import Miscellaneous from "./views/Setup/Miscellaneous/Miscellaneous";
import FixedAssestsMaintenance from "./views/FixedAssets/Maintenance/FixedAssestsMaintenance";
import FixedAssestsInquiriesAndReports from "./views/FixedAssets/InquiriesAndReports/FixedAssestsInquiriesAndReports";
import CompanySetupForm from "./views/Setup/CompanySetup/CompanySetup/CompanySetupForm";
import AddUserForm from "./views/Setup/CompanySetup/User/AddUserForm";
import UserManagementTable from "./views/Setup/CompanySetup/User/UserManagementTable";
import FiscalYear from "./views/Setup/CompanySetup/FiscalYear/AddFiscalYear";
import FiscalYearTable from "./views/Setup/CompanySetup/FiscalYear/FiscalYearTable";
import TaxGroupsTable from "./views/Setup/CompanySetup/TaxGroups/TaxGroupsTable";
import TaxGroups from "./views/Setup/CompanySetup/TaxGroups/AddTaxGroups";
import TaxTypes from "./views/Setup/CompanySetup/TaxTypes/AddTaxTypes";
import TaxTypesTable from "./views/Setup/CompanySetup/TaxTypes/TaxTypesTable";
import Currencies from "./views/BankindAndGeneralLedger/Maintenance/Currencies/AddCurrencies";
import CurrenciesTable from "./views/BankindAndGeneralLedger/Maintenance/Currencies/CurrenciesTable";
import UserAccessForm from "./views/Setup/CompanySetup/UserAccess/AddUserAccessForm";
import AddUserAccessForm from "./views/Setup/CompanySetup/UserAccess/AddUserAccessForm";
import UpdateUserAccessForm from "./views/Setup/CompanySetup/UserAccess/UpdateUserAccessForm";
import UpdateUserForm from "./views/Setup/CompanySetup/User/UpdateUserForm";
import AddTaxTypes from "./views/Setup/CompanySetup/TaxTypes/AddTaxTypes";
import UpdateTaxTypes from "./views/Setup/CompanySetup/TaxTypes/UpdateTaxTypes";
import AddTaxGroupsForm from "./views/Setup/CompanySetup/TaxGroups/AddTaxGroups";
import UpdateTaxGroupsForm from "./views/Setup/CompanySetup/TaxGroups/UpdateTaxGroups";
import AddFiscalYear from "./views/Setup/CompanySetup/FiscalYear/AddFiscalYear";
import UpdateFiscalYear from "./views/Setup/CompanySetup/FiscalYear/UpdateFiscalYear";
import AddCurrencies from "./views/BankindAndGeneralLedger/Maintenance/Currencies/AddCurrencies";
import UpdateCurrencies from "./views/BankindAndGeneralLedger/Maintenance/Currencies/UpdateCurrencies";
import AddSalesPerson from "./views/Sales/Maintenance/SalesPersons/AddSalesPersonForm";
import UpdateSalesPerson from "./views/Sales/Maintenance/SalesPersons/UpdateSalesPersonForm";
import SalesPersonTable from "./views/Sales/Maintenance/SalesPersons/SalesPersonTable";
import AddSalesAreaForm from "./views/Sales/Maintenance/SalesAreas/AddSalesAreaForm";
import UpdateSalesAreaForm from "./views/Sales/Maintenance/SalesAreas/UpdateSalesAreaForm";
import SalesAreaTable from "./views/Sales/Maintenance/SalesAreas/SalesAreaTable";
import SalesTypesTable from "./views/Sales/Maintenance/SalesTypes/SalesTypesTable";
import AddSalesTypesForm from "./views/Sales/Maintenance/SalesTypes/AddSalesTypesForm";
import UpdateSalesTypesForm from "./views/Sales/Maintenance/SalesTypes/UpdateSalesTypesForm";
import CreditStatusTable from "./views/Sales/Maintenance/CreditStatusSetup/CreditStatusTable";
import AddCreditStatusForm from "./views/Sales/Maintenance/CreditStatusSetup/AddCreditStatusForm";
import UpdateCreditStatusForm from "./views/Sales/Maintenance/CreditStatusSetup/UpdateCreditStatusForm";
import AddManageCutomers from "./views/Sales/Maintenance/AddManageCustomers/AddManageCustomers";
import AddSalesGroupsForm from "./views/Sales/Maintenance/SalesGroups/AddSalesGroupsForm";
import UpdateSalesGroupsForm from "./views/Sales/Maintenance/SalesGroups/UpdateSalesGroupsForm";
import SalesGroupsTable from "./views/Sales/Maintenance/SalesGroups/SalesGroupsTable";
import Suppliers from "./views/Purchases/Maintenance/Suppliers/Suppliers";
import GeneralSettingsForm from "./views/Sales/Maintenance/AddManageCustomers/GeneralSettingsForm/GeneralSettingsForm";
import SupplierGeneralSettingsForm from "./views/Purchases/Maintenance/Suppliers/GeneralSettings/SupplierGeneralSettingsForm";
import UpdateSupplierGeneralSettingsForm from "./views/Purchases/Maintenance/Suppliers/GeneralSettings/UpdateSupplierGeneralSettingsForm";
import UnitsOfMeasureTable from "./views/ItemsAndInventory/Maintenance/UnitsOfMeasure/UnitsOfMeasureTable";
import AddUnitsOfMeasureForm from "./views/ItemsAndInventory/Maintenance/UnitsOfMeasure/AddUnitsOfMeasureForm";
import UpdateUnitsOfMeasureForm from "./views/ItemsAndInventory/Maintenance/UnitsOfMeasure/UpdateUnitsOfMeasureForm";
import Items from "./views/ItemsAndInventory/Maintenance/Items/Items";
import ItemsGeneralSettingsForm from "./views/ItemsAndInventory/Maintenance/Items/ItemsGeneralSettings/ItemsGeneralSettingsForm";
import InventoryLocationTable from "./views/ItemsAndInventory/Maintenance/InventoryLocations/InventoryLocationTable";
import AddInventoryLocationForm from "./views/ItemsAndInventory/Maintenance/InventoryLocations/AddInventoryLocationsForm";
import UpdateInventoryLocationForm from "./views/ItemsAndInventory/Maintenance/InventoryLocations/UpdateInventoryLocationsForm";
import ItemCategoriesTable from "./views/ItemsAndInventory/Maintenance/ItemCategories/ItemCategoriesTable";
import AddItemCategoriesForm from "./views/ItemsAndInventory/Maintenance/ItemCategories/AddItemCategoriesForm";
import UpdateItemCategoriesForm from "./views/ItemsAndInventory/Maintenance/ItemCategories/UpdateItemCategoriesForm";
import WorkCentresTable from "./views/Manufacturing/Maintenance/WorkCenter/WorkCentresTable";
import AddWorkCentresForm from "./views/Manufacturing/Maintenance/WorkCenter/AddWorkCentresForm";
import UpdateWorkCentresForm from "./views/Manufacturing/Maintenance/WorkCenter/UpdateWorkCentresForm";
import BankAccountsTable from "./views/BankindAndGeneralLedger/Maintenance/BankAccounts/BankAccountsTable";
import AddBankAccountsForm from "./views/BankindAndGeneralLedger/Maintenance/BankAccounts/AddBankAccountsForm";
import UpdateBankAccountsForm from "./views/BankindAndGeneralLedger/Maintenance/BankAccounts/UpdateBankAccountsForm";
import AddQuickEntriesForm from "./views/BankindAndGeneralLedger/Maintenance/QuickEntries/AddQuickEntriesForm";
import UpdateQuickEntriesForm from "./views/BankindAndGeneralLedger/Maintenance/QuickEntries/UpdateQuickEntriesForm";
import QuickEntriesTable from "./views/BankindAndGeneralLedger/Maintenance/QuickEntries/QuickEntriesTable";
import GlAccountGroupsTable from "./views/BankindAndGeneralLedger/Maintenance/GlAccountGroups/GlAccountGroupsTable";
import AddGlAccountGroupsForm from "./views/BankindAndGeneralLedger/Maintenance/GlAccountGroups/AddGlAccountGroupsForm";
import UpdateGlAccountGroupsForm from "./views/BankindAndGeneralLedger/Maintenance/GlAccountGroups/UpdateGlAccountGroupsForm";
import RevaluateCurrenciesForm from "./views/BankindAndGeneralLedger/Maintenance/RevaluationOfCurrencyAccounts/RevaluateCurrencies";
import GlAccountClassesTable from "./views/BankindAndGeneralLedger/Maintenance/GlAccountClasses/GlAccountClassesTable";
import AddGlAccountClassesForm from "./views/BankindAndGeneralLedger/Maintenance/GlAccountClasses/AddGlAccountClassesForm";
import UpdateGlAccountClassesForm from "./views/BankindAndGeneralLedger/Maintenance/GlAccountClasses/UpdateGlAccountClassesForm";
import AddChartofAccounts from "./views/Setup/Maintenance/ChartOfAccounts/AddChartOfAccounts";
import ItemTaxTypesTable from "./views/Setup/CompanySetup/ItemTaxTypes/ItemTaxTypesTable";
import AddItemTaxTypes from "./views/Setup/CompanySetup/ItemTaxTypes/AddItemTaxTypes";
import UpdateItemTaxTypes from "./views/Setup/CompanySetup/ItemTaxTypes/UpdateItemTaxTypes";
import SystemGLSetupForm from "./views/Setup/CompanySetup/SystemAndGeneralGlSetup/SystemGLSetupForm";
import CustomersContactsTable from "./views/Sales/Maintenance/AddManageCustomers/Contacts/CustomersContactsTable";
import AttachmentsTable from "./views/Sales/Maintenance/AddManageCustomers/Attachments/AttachmentsTable";
import AddAttachmentsForm from "./views/Sales/Maintenance/AddManageCustomers/Attachments/AddAttachments";
import UpdateAttachmentsForm from "./views/Sales/Maintenance/AddManageCustomers/Attachments/UpdateAttachments";
import SalesOrdersTable from "./views/Sales/Maintenance/AddManageCustomers/SalesOrders/SalesOrdersTable";
import TransactionsTable from "./views/Sales/Maintenance/AddManageCustomers/Transactions/TransactionsTable";
import AccountTagsTable from "./views/BankindAndGeneralLedger/Maintenance/AccountTags/AccountTagsTable";
import AddAccountTagsForm from "./views/BankindAndGeneralLedger/Maintenance/AccountTags/AddAccountTagsForm";
import UpdateAccountTagsForm from "./views/BankindAndGeneralLedger/Maintenance/AccountTags/UpdateAccountTagsForm";
import AddExchangeRateForm from "./views/BankindAndGeneralLedger/Maintenance/ExchangeRates/AddExchangeRateForm";
import UpdateExchangeRateForm from "./views/BankindAndGeneralLedger/Maintenance/ExchangeRates/UpdateExchangeRateForm";
import ExchangeRateTable from "./views/BankindAndGeneralLedger/Maintenance/ExchangeRates/ExchangeRateTable";
import AddGlAccount from "./views/BankindAndGeneralLedger/Maintenance/GlAccounts/AddGlAccount";
import AddSalesPricingForm from "./views/ItemsAndInventory/Maintenance/Items/SalesPricing/AddSalesPricingForm";
import UpdateSalesPricingForm from "./views/ItemsAndInventory/Maintenance/Items/SalesPricing/UpdateSalesPricingForm";
import SalesPricingTable from "./views/ItemsAndInventory/Maintenance/Items/SalesPricing/SalesPricingTable";
import PurchasingPricingTable from "./views/ItemsAndInventory/Maintenance/Items/PurchasingPricing/PurchasingPricingTable";
import AddPurchasingPricingForm from "./views/ItemsAndInventory/Maintenance/Items/PurchasingPricing/AddPurchasingPricingForm";
import UpdatePurchasePricingForm from "./views/ItemsAndInventory/Maintenance/Items/PurchasingPricing/UpdatePurchasingPricingForm";
import AddStandardCostForm from "./views/ItemsAndInventory/Maintenance/Items/StandardCosts/AddStandardCostForm";
import StatusTable from "./views/ItemsAndInventory/Maintenance/Items/Status/StatusTable";
import SuppliersContactsTable from "./views/Purchases/Maintenance/Suppliers/Contacts/SuppliersContactsTable";
import SuppliersAttachmentsTable from "./views/Purchases/Maintenance/Suppliers/Attachments/SuppliersAttachmentsTable";
import AddSuppliersAttachmentsForm from "./views/Purchases/Maintenance/Suppliers/Attachments/AddSuppliersAttachmentsForm";
import UpdateSuppliersAttachmentsForm from "./views/Purchases/Maintenance/Suppliers/Attachments/UpdateSuppliersAttachmentsForm";
import SuppliersTransactionsTable from "./views/Purchases/Maintenance/Suppliers/Transactions/SuppliersTransactionsTable";
import SupplierPurchaseOrdersTable from "./views/Purchases/Maintenance/Suppliers/PurchaseOrders/SupplierPurchaseOrders";
import AddSuppliersContactsForm from "./views/Purchases/Maintenance/Suppliers/Contacts/AddSuppliersContactsForm";
import UpdateSuppliersContactsForm from "./views/Purchases/Maintenance/Suppliers/Contacts/UpdateSuppliersContactsForm";
import CustomersBranches from "./views/Sales/Maintenance/CustomerBranches/CustomerBranches";
import AddCustomerBranchesGeneralSettingForm from "./views/Sales/Maintenance/CustomerBranches/GeneralSettings/AddCustomerBranchesGeneralSettingForm";
import UpdateCustomerBranchesGeneralSettingForm from "./views/Sales/Maintenance/CustomerBranches/GeneralSettings/UpdateCustomerBranchesGeneralSettingForm";
import CustomerBranchesTable from "./views/Sales/Maintenance/CustomerBranches/GeneralSettings/CustomerBranchesTable";
import AddContactsForm from "./views/Sales/Maintenance/CustomerBranches/Contacts/AddContactsForm";
import UpdateContactsForm from "./views/Sales/Maintenance/CustomerBranches/Contacts/UpdateContactsForm";
import ItemAttachmentsTable from "./views/ItemsAndInventory/Maintenance/Items/Attachments/ItemAttachmentsTable";
import AddItemAttachmentsForm from "./views/ItemsAndInventory/Maintenance/Items/Attachments/AddItemAttachmentsForm";
import UpdateItemAttachmentsForm from "./views/ItemsAndInventory/Maintenance/Items/Attachments/UpdateItemAttachmentsForm";
import ReOrderLevelsForm from "./views/ItemsAndInventory/Maintenance/Items/ReOrderLevels/ReOrderLevelsForm";
import ItemTransactionsTable from "./views/ItemsAndInventory/Maintenance/Items/Transactions/ItemTransactionsTable";
import ForeignItemCodesTable from "./views/ItemsAndInventory/Maintenance/ForeignItemCodes/ForeignItemCodesTable";
import AddForeignItemCodesForm from "./views/ItemsAndInventory/Maintenance/ForeignItemCodes/AddForeignItemCodesForm";
import UpdateForeignItemCodesForm from "./views/ItemsAndInventory/Maintenance/ForeignItemCodes/UpdateForeignItemCodesForm";
import AddSalesKitsForm from "./views/ItemsAndInventory/Maintenance/SalesKits/AddSalesKitsForm";
import UpdateCustomersContactsForm from "./views/Sales/Maintenance/AddManageCustomers/Contacts/UpdateCustomersContactsForm";
import AddCustomersContactsForm from "./views/Sales/Maintenance/AddManageCustomers/Contacts/AddCustomersContactsForm";
import ContactsTable from "./views/Sales/Maintenance/CustomerBranches/Contacts/ContactsTable";
import VoidTransactionTable from "./views/Setup/Maintenance/VoidTransaction/VoidTransactionTable";
import VoidTransaction from "./views/Setup/Maintenance/VoidTransaction/VoidTransaction";
import ViewPrintTransactions from "./views/Setup/Maintenance/ViewPrintTransactions/ViewPrintTransactions";
import DocumentsTable from "./views/Setup/Maintenance/AttachDocuments/DocumentsTable";
import AddDocumentsForm from "./views/Setup/Maintenance/AttachDocuments/AddDocumentsForm";
import UpdateDocumentsForm from "./views/Setup/Maintenance/AttachDocuments/UpdateDocumentsForm";
import BackupRestore from "./views/Setup/Maintenance/BackupAndRestore/BackupRestore";
import CompanyTable from "./views/Setup/Maintenance/CreateUpdateCompany/CompanyTable";
import AddCompanyForm from "./views/Setup/Maintenance/CreateUpdateCompany/AddCompanyForm";
import UpdateCompanyForm from "./views/Setup/Maintenance/CreateUpdateCompany/UpdateCompanyForm";
import FixedAssetsLocationsTable from "./views/FixedAssets/Maintenance/FixedAssets/FixedAssetsLocationsTable";
import AddFixedAssetsLocations from "./views/FixedAssets/Maintenance/FixedAssets/AddFixedAssetsLocationsForm";
import UpdateFixedAssetsLocations from "./views/FixedAssets/Maintenance/FixedAssets/UpdateFixedAssetsLocationsForm";
import DimensionTagsTable from "./views/Dimensions/Maintenance/DimensionTags/DimensionTagsTable";
import AddDimensionTagsForm from "./views/Dimensions/Maintenance/DimensionTags/AddDimensionTagsForm";
import UpdateDimensionTagsForm from "./views/Dimensions/Maintenance/DimensionTags/UpdateDimensionTagsForm";
import LanguagesTable from "./views/Setup/Maintenance/InstallUpdateLanguages/LanguagesTable";
import AddLanguagesForm from "./views/Setup/Maintenance/InstallUpdateLanguages/AddLanguagesForm";
import UpdateLanguagesForm from "./views/Setup/Maintenance/InstallUpdateLanguages/UpdateLanguagesForm";
import InstallExtensions from "./views/Setup/Maintenance/InstallActivateExtensions/InstallExtensions";
import InstallThemes from "./views/Setup/Maintenance/InstallActivateThemes/InstallThemes";
import SoftwareUpdateTable from "./views/Setup/Maintenance/SoftwareUpgrade/SoftwareUpgrade";
import InstallChartOfAccounts from "./views/Setup/Maintenance/InstallChartOfAccounts/InstallChartOfAccounts";
import SystemDiagnostics from "./views/Setup/Maintenance/SystemDiagnostic/SystemDiagnostics";
import UpdateGeneralSettingsForm from "./views/Sales/Maintenance/AddManageCustomers/GeneralSettingsForm/UpdateGeneralSettingsForm";
import TransactionReferencesTable from "./views/Setup/CompanySetup/TransactionReferences/TransactionReferencesTable";
import AddTransactionReferencesForm from "./views/Setup/CompanySetup/TransactionReferences/AddTransactionReferencesForm";
import UpdateTransactionReferencesForm from "./views/Setup/CompanySetup/TransactionReferences/UpdateTransactionReferencesForm";
import AddPaymentTermsForm from "./views/Setup/Miscellaneous/PaymentTerms/AddPaymentTermsForm";
import UpdatePaymentTermsForm from "./views/Setup/Miscellaneous/PaymentTerms/UpdatePaymentTermsForm";
import PaymentTermsTable from "./views/Setup/Miscellaneous/PaymentTerms/PaymentTermsTable";
import ShippingCompanyTable from "./views/Setup/Miscellaneous/ShippingCompany/ShippingCompanyTable";
import AddShippingCompanyForm from "./views/Setup/Miscellaneous/ShippingCompany/AddShippinCompanyForm";
import UpdateShippingCompanyForm from "./views/Setup/Miscellaneous/ShippingCompany/UpdateShippinCompanyForm";
import ContactCategoryTable from "./views/Setup/Miscellaneous/ContactCategories/ContactCategoryTable";
import AddContactCategory from "./views/Setup/Miscellaneous/ContactCategories/AddContactCategoryForm";
import UpdateContactCategory from "./views/Setup/Miscellaneous/ContactCategories/UpdateContactCategoryForm";
import PrintersTable from "./views/Setup/Miscellaneous/Printers/PrintersTable";
import AddPrintersForm from "./views/Setup/Miscellaneous/Printers/AddPrintersForm";
import UpdatePrintersForm from "./views/Setup/Miscellaneous/Printers/UpdatePrintersForm";
import PosTable from "./views/Setup/Miscellaneous/PointsOfSales/PosTable";
import AddPosForm from "./views/Setup/Miscellaneous/PointsOfSales/AddPosForm";
import UpdatePosForm from "./views/Setup/Miscellaneous/PointsOfSales/UpdatePosForm";
import UpdateGlAccount from "./views/BankindAndGeneralLedger/Maintenance/GlAccounts/UpdateGlAccount";


const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));
const RegistrationPage = React.lazy(
  () => import("./views/RegistrationPage/RegistrationPage")
);
// const InsightsPage = React.lazy(() => import("./views/Insights/Insight"));

//Administration
const UserTable = React.lazy(() => import("./views/Administration/UserTable"));
const AccessManagementTable = React.lazy(
  () => import("./views/Administration/AccessManagementTable")
);
const OrganizationTable = React.lazy(
  () => import("./views/Administration/OrganizationSettings/OrganizationSettingsTable")
);

const UnderDevelopment = React.lazy(
  () => import("./components/UnderDevelopment")
);

//sustainability apps
//chemical management
// const ChemicalRequestTable = React.lazy(
//   () => import("./views/ChemicalMng/ChemicalRequestTable")
// );
// const ChemicalPurchaseInventoryTable = React.lazy(
//   () => import("./views/ChemicalMng/ChemicalPurchaseInventoryTable")
// );
// const ChemicalTransactionTable = React.lazy(
//   () => import("./views/ChemicalMng/TransactionTable")
// );
// const ChemicalDashboard = React.lazy(
//   () => import("./views/ChemicalMng/Dashboard")
// );

//health and safety apps
//document
const DocumentRegister = React.lazy(
  () => import("./views/DocumentsPage/DocumentsTable")
);



const Autocomplete = React.lazy(
  () => import("./views/Components/Autocomplete")
);
const TextField = React.lazy(
  () => import("./views/Components/TextField")
);
const DatePickers = React.lazy(
  () => import("./views/Components/DatePickers")
);
const OtherInputs = React.lazy(
  () => import("./views/Components/OtherInputs")
);

const AccordianAndDividers = React.lazy(
  () => import("./views/Components/AccordianAndDividers")
);
function withLayout(Layout: any, Component: any, restrictAccess = false) {
  return (
    <Layout>
      <Suspense
        fallback={
          <>
            <PageLoader />
          </>
        }
      >
        {restrictAccess ? <PermissionDenied /> : <Component />}
      </Suspense>
    </Layout>
  );
}

function withoutLayout(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense
      fallback={
        <>
          <PageLoader />
        </>
      }
    >
      <Component />
    </Suspense>
  );
}

const ProtectedRoute = () => {
  const location = useLocation();
  const { data: user, status } = useQuery({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  // While checking user, show loader
  

  // If no user, redirect to login and save the page they tried to access
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If user exists, render child routes
  return <Outlet />;
};

const AppRoutes = () => {
  const { data: user, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);
  console.log("user", user);
  return (
    <Routes>
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/register" element={withoutLayout(RegistrationPage)} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={withLayout(MainLayout, Dashboard)}
        />
      </Route>

      {/* Administration */}
      <Route
        path="/admin/organization-settings"
        element={withLayout(
          MainLayout,
          OrganizationTable,
          !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW]
        )}
      />

      <Route
        path="/admin/users"
        element={withLayout(
          MainLayout,
          UserTable,
          !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW]
        )}
      />
      <Route
        path="/admin/access-management"
        element={withLayout(
          MainLayout,
          AccessManagementTable,
          !userPermissionObject?.[PermissionKeys.ADMIN_ACCESS_MNG_VIEW]
        )}
      />

      {/* Audit & Inspection */}
      {/* <Route
          path="/input-fields/autocomplete"
          element={withLayout(
            MainLayout,
            Autocomplete,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_DASHBOARD_VIEW
            ]
          )}
        />
        <Route
          path="/input-fields/textfield"
          element={withLayout(
            MainLayout,
            TextField,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_DASHBOARD_VIEW
            ]
          )}
        />
        <Route
          path="/input-fields/date-pickers"
          element={withLayout(
            MainLayout,
            DatePickers,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_DASHBOARD_VIEW
            ]
          )}
        />
        <Route
          path="/input-fields/other-inputs"
          element={withLayout(
            MainLayout,
            OtherInputs,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_DASHBOARD_VIEW
            ]
          )}
        />
        <Route
          path="/components/accordian-divider"
          element={withLayout(
            MainLayout,
            AccordianAndDividers,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_DASHBOARD_VIEW
            ]
          )}
        />
        <Route
          path="/audit-inspection/calendar"
          element={withLayout(
            MainLayout,
            AuditCalendar */}
            // !userPermissionObject?.[
      //   PermissionKeys.AUDIT_INSPECTION_CALENDAR_VIEW
      // ]
      {/* )}
        /> */}
      {/* <Route
          path="/audit-inspection/internal-audit/form-builder"
          element={withLayout(
            MainLayout,
            AuditBuilderTable,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_INTERNAL_AUDIT_FORM_BUILDER_VIEW
            ]
          )}
        />
        <Route
          path="/audit-inspection/internal-audit/scheduled-audits"
          element={withLayout(
            MainLayout,
            InternalAuditTable,
            !userPermissionObject?.[
            PermissionKeys.AUDIT_INSPECTION_INTERNAL_AUDIT_REGISTER_VIEW
            ]
          )}
        />
        <Route
          path="/audit-inspection/external-audit"
          element={withLayout(
            MainLayout,
            () => (
              <UnderDevelopment pageName="Audit & Inspection > External Audit" />
            ) */}
            // !userPermissionObject?.[
      //   PermissionKeys.AUDIT_INSPECTION_EXTERNAL_AUDIT_QUEUE_VIEW
      // ]
      {/* )}
        /> */}

      {/* sustainability apps */}


      {/* document */}
      <Route
        path="/document"
        element={withLayout(
          MainLayout,
          DocumentRegister,
          !userPermissionObject?.[PermissionKeys.DOCUMENT_REGISTER_VIEW]
        )}
      />
      <Route
        path="/occupational-health/clinical-suite/consultation"
        element={withLayout(
          MainLayout,
          () => (
            <UnderDevelopment pageName="Clinical Suite > Consultation" />
          )
          // !userPermissionObject?.[
          //   PermissionKeys
          //     .OCCUPATIONAL_HEALTH_CLINICAL_SUITE_CONSULTATION_VIEW
          // ]
        )}
      />

      <Route
        path="/occupational-health/clinical-suite/pharmacy-queue"
        element={withLayout(
          MainLayout,
          () => (
            <UnderDevelopment pageName="Clinical Suite > Pharmacy Queue" />
          )
          // !userPermissionObject?.[
          //   PermissionKeys
          //     .OCCUPATIONAL_HEALTH_CLINICAL_SUITE_PHARMACY_QUEUE_VIEW
          // ]
        )}
      />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/sales/transactions"
          element={withLayout(MainLayout, SalesTransactions)}
        />
        <Route
          path="/sales/transactions/sales-quotation-entry"
          element={withLayout(MainLayout, SalesQuotationEntry)}
        />
        <Route
          path="/sales/inquiriesandreports"
          element={withLayout(MainLayout, InquiriesAndReports)}
        />
        <Route
          path="/sales/maintenance"
          element={withLayout(MainLayout, Maintenance)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers"
          element={withLayout(MainLayout, AddManageCutomers)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/general-settings"
          element={withLayout(MainLayout, GeneralSettingsForm)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/update-customer/:id"
          element={withLayout(MainLayout, UpdateGeneralSettingsForm)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/contacts"
          element={withLayout(MainLayout, CustomersContactsTable)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/add-customers-contacts"
          element={withLayout(MainLayout, AddCustomersContactsForm)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/update-customers-contacts/:id"
          element={withLayout(MainLayout, UpdateCustomersContactsForm)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/transactions"
          element={withLayout(MainLayout, TransactionsTable)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/sales-orders"
          element={withLayout(MainLayout, SalesOrdersTable)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/attachments"
          element={withLayout(MainLayout, AttachmentsTable)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/add-attachments"
          element={withLayout(MainLayout, AddAttachmentsForm)}
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/update-attachments"
          element={withLayout(MainLayout, UpdateAttachmentsForm)}
        />
        <Route
          path="/sales/maintenance/customer-branches"
          element={withLayout(MainLayout, CustomersBranches)}
        />
        <Route
          path="/sales/maintenance/customer-branches/general-settings"
          element={withLayout(MainLayout, CustomerBranchesTable)}
        />
        <Route
          path="/sales/maintenance/customer-branches/add-general-settings/:id"
          element={withLayout(MainLayout, AddCustomerBranchesGeneralSettingForm)}
        />
        <Route
          path="/sales/maintenance/customer-branches/update-general-settings/:branchCode"
          element={withLayout(MainLayout, UpdateCustomerBranchesGeneralSettingForm)}
        />
        <Route
          path="/sales/maintenance/customer-branches/branches-contacts"
          element={withLayout(MainLayout, ContactsTable)}
        />
        <Route
          path="/sales/maintenance/customer-branches/add-customer-branches-contacts/"
          element={withLayout(MainLayout, AddContactsForm)}
        />
        <Route
          path="/sales/maintenance/customer-branches/update-customer-branches-contacts/:id"
          element={withLayout(MainLayout, UpdateContactsForm)}
        />
        <Route
          path="/sales/maintenance/sales-groups"
          element={withLayout(MainLayout, SalesGroupsTable)}
        />
        <Route
          path="/sales/maintenance/sales-groups/add-sales-groups"
          element={withLayout(MainLayout, AddSalesGroupsForm)}
        />
        <Route
          path="/sales/maintenance/sales-groups/update-sales-groups/:id"
          element={withLayout(MainLayout, UpdateSalesGroupsForm)}
        />
        <Route
          path="/sales/maintenance/sales-persons"
          element={withLayout(MainLayout, SalesPersonTable)}
        />
        <Route
          path="/sales/maintenance/sales-persons/add-sales-person"
          element={withLayout(MainLayout, AddSalesPerson)}
        />
        <Route
          path="/sales/maintenance/sales-persons/update-sales-person/:id"
          element={withLayout(MainLayout, UpdateSalesPerson)}
        /><Route
          path="/sales/maintenance/sales-areas"
          element={withLayout(MainLayout, SalesAreaTable)}
        />
        <Route
          path="/sales/maintenance/sales-areas/add-sales-area"
          element={withLayout(MainLayout, AddSalesAreaForm)}
        />
        <Route
          path="/sales/maintenance/sales-areas/update-sales-area/:id"
          element={withLayout(MainLayout, UpdateSalesAreaForm)}
        />
        <Route
          path="/sales/maintenance/sales-types/"
          element={withLayout(MainLayout, SalesTypesTable)}
        />
        <Route
          path="/sales/maintenance/sales-areas/add-sales-types"
          element={withLayout(MainLayout, AddSalesTypesForm)}
        />
        <Route
          path="/sales/maintenance/sales-areas/update-sales-types/:id"
          element={withLayout(MainLayout, UpdateSalesTypesForm)}
        />
        <Route
          path="/sales/maintenance/credit-status-setup"
          element={withLayout(MainLayout, CreditStatusTable)}
        />
        <Route
          path="/sales/maintenance/credit-status-setup/add-credit-status"
          element={withLayout(MainLayout, AddCreditStatusForm)}
        />
        <Route
          path="/sales/maintenance/credit-status-setup/update-credit-status/:id"
          element={withLayout(MainLayout, UpdateCreditStatusForm)}
        />


        <Route
          path="/purchase/transactions"
          element={withLayout(MainLayout, PurchaseTransactions)}
        />
        <Route
          path="/purchase/inquiriesandreports"
          element={withLayout(MainLayout, PurchaseInquiriesAndReports)}
        />
        <Route
          path="/purchase/maintenance"
          element={withLayout(MainLayout, PurchaseMaintenance)}
        />
        <Route
          path="/purchase/maintenance/suppliers"
          element={withLayout(MainLayout, Suppliers)}
        />
        <Route
          path="/purchase/maintenance/suppliers/general-settings"
          element={withLayout(MainLayout, SupplierGeneralSettingsForm)}
        />
        <Route
          path="/purchase/maintenance/suppliers/update/:id"
          element={withLayout(MainLayout, UpdateSupplierGeneralSettingsForm)}
        />
        <Route
          path="/purchase/maintenance/suppliers/contacts"
          element={withLayout(MainLayout, SuppliersContactsTable)}
        />
        <Route
          path="/purchase/maintenance/suppliers/add-supplier-contact"
          element={withLayout(MainLayout, AddSuppliersContactsForm)}
        />
        <Route
          path="/purchase/maintenance/suppliers/update-supplier-contact/:id"
          element={withLayout(MainLayout, UpdateSuppliersContactsForm)}
        />
        <Route
          path="/purchase/maintenance/suppliers/attachments"
          element={withLayout(MainLayout, SuppliersAttachmentsTable)}
        />
        <Route
          path="/purchase/maintenance/suppliers/add-attachments"
          element={withLayout(MainLayout, AddSuppliersAttachmentsForm)}
        />
        <Route
          path="/purchase/maintenance/suppliers/update-attachments"
          element={withLayout(MainLayout, UpdateSuppliersAttachmentsForm)}
        />
        <Route
          path="/purchase/maintenance/suppliers/transactions"
          element={withLayout(MainLayout, SuppliersTransactionsTable)}
        />
        <Route
          path="/purchase/maintenance/suppliers/purchases-orders"
          element={withLayout(MainLayout, SupplierPurchaseOrdersTable)}
        />

        <Route
          path="/itemsandinventory/transactions"
          element={withLayout(MainLayout, ItemsTransactions)}
        />
        <Route
          path="/itemsandinventory/inquiriesandreports"
          element={withLayout(MainLayout, ItemsInquiriesAndReports)}
        />
        <Route
          path="/itemsandinventory/maintenance"
          element={withLayout(MainLayout, ItemsMaintenance)}
        />
        <Route
          path="/itemsandinventory/maintenance/units-of-measure"
          element={withLayout(MainLayout, UnitsOfMeasureTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/units-of-measure/add-units-of-measure"
          element={withLayout(MainLayout, AddUnitsOfMeasureForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/units-of-measure/update-units-of-measure/:id"
          element={withLayout(MainLayout, UpdateUnitsOfMeasureForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items"
          element={withLayout(MainLayout, Items)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/general-settings"
          element={withLayout(MainLayout, ItemsGeneralSettingsForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/sales-pricing"
          element={withLayout(MainLayout, SalesPricingTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/add-sales-pricing"
          element={withLayout(MainLayout, AddSalesPricingForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/update-sales-pricing/:id"
          element={withLayout(MainLayout, UpdateSalesPricingForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/purchasing-pricing"
          element={withLayout(MainLayout, PurchasingPricingTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/add-purchasing-pricing"
          element={withLayout(MainLayout, AddPurchasingPricingForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/update-purchasing-pricing"
          element={withLayout(MainLayout, UpdatePurchasePricingForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/standard-costs"
          element={withLayout(MainLayout, AddStandardCostForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/reorder-levels"
          element={withLayout(MainLayout, ReOrderLevelsForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/transactions"
          element={withLayout(MainLayout, ItemTransactionsTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/status"
          element={withLayout(MainLayout, StatusTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/attachments"
          element={withLayout(MainLayout, ItemAttachmentsTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/add-attachments"
          element={withLayout(MainLayout, AddItemAttachmentsForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/items/update-attachments"
          element={withLayout(MainLayout, UpdateItemAttachmentsForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/update-units-of-measure"
          element={withLayout(MainLayout, UpdateUnitsOfMeasureForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/foreign-item-codes"
          element={withLayout(MainLayout, ForeignItemCodesTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/add-foreign-item-codes"
          element={withLayout(MainLayout, AddForeignItemCodesForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/update-foreign-item-codes"
          element={withLayout(MainLayout, UpdateForeignItemCodesForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/sales-kits"
          element={withLayout(MainLayout, AddSalesKitsForm)}
        />

        <Route
          path="/itemsandinventory/maintenance/inventory-locations"
          element={withLayout(MainLayout, InventoryLocationTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/add-inventory-location"
          element={withLayout(MainLayout, AddInventoryLocationForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/update-inventory-location/:id"
          element={withLayout(MainLayout, UpdateInventoryLocationForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/item-categories"
          element={withLayout(MainLayout, ItemCategoriesTable)}
        />
        <Route
          path="/itemsandinventory/maintenance/add-item-categories"
          element={withLayout(MainLayout, AddItemCategoriesForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/update-item-categories"
          element={withLayout(MainLayout, UpdateItemCategoriesForm)}
        />
        <Route
          path="/itemsandinventory/maintenance/reorder-levels"
          element={withLayout(MainLayout, ReOrderLevelsForm)}
        />
        <Route
          path="/itemsandinventory/pricingandcosts/sales-pricing"
          element={withLayout(MainLayout, SalesPricingTable)}
        />
        <Route
          path="/itemsandinventory/pricingandcosts/purchasing-pricing"
          element={withLayout(MainLayout, PurchasingPricingTable)}
        />
        <Route
          path="/itemsandinventory/pricingandcosts/standard-costs"
          element={withLayout(MainLayout, AddStandardCostForm)}
        />

        <Route
          path="/itemsandinventory/pricingandcosts"
          element={withLayout(MainLayout, ItemsPricingAndCosts)}
        />

        <Route
          path="/manufacturing/transactions"
          element={withLayout(MainLayout, ManufacturingTransactions)}
        />
        <Route
          path="/manufacturing/inquiriesandreports"
          element={withLayout(MainLayout, ManufacturingInquiriesAndReports)}
        />
        <Route
          path="/manufacturing/maintenance"
          element={withLayout(MainLayout, ManufacturingMaintenance)}
        />
        <Route
          path="/manufacturing/maintenance/work-centres"
          element={withLayout(MainLayout, WorkCentresTable)}
        />
        <Route
          path="/manufacturing/maintenance/add-work-centres"
          element={withLayout(MainLayout, AddWorkCentresForm)}
        />
        <Route
          path="/manufacturing/maintenance/update-work-centres/:id"
          element={withLayout(MainLayout, UpdateWorkCentresForm)}
        />


        <Route
          path="/fixedassets/transactions"
          element={withLayout(MainLayout, FixedAssestsTransactions)}
        />
        <Route
          path="/fixedassets/inquiriesandreports"
          element={withLayout(MainLayout, FixedAssestsInquiriesAndReports)}
        />
        <Route
          path="/fixedassets/maintenance"
          element={withLayout(MainLayout, FixedAssestsMaintenance)}
        />
        <Route
          path="/fixedassets/maintenance/fixed-asset-locations"
          element={withLayout(MainLayout, FixedAssetsLocationsTable)}
        />
        <Route
          path="/fixedassets/maintenance/add-fixed-asset-location"
          element={withLayout(MainLayout, AddFixedAssetsLocations)}
        />
        <Route
          path="/fixedassets/maintenance/update-fixed-asset-location/:id"
          element={withLayout(MainLayout, UpdateFixedAssetsLocations)}
        />

        <Route
          path="/dimension/transactions"
          element={withLayout(MainLayout, DimensionTransactions)}
        />
        <Route
          path="/dimension/inquiriesandreports"
          element={withLayout(MainLayout, DimensionInquiriesAndReports)}
        />
        <Route
          path="/dimension/maintenance"
          element={withLayout(MainLayout, DimensionMaintenance)}
        />
        <Route
          path="/dimension/maintenance/dimension-tags"
          element={withLayout(MainLayout, DimensionTagsTable)}
        />
        <Route
          path="/dimension/maintenance/add-dimension-tags"
          element={withLayout(MainLayout, AddDimensionTagsForm)}
        />
        <Route
          path="/dimension/maintenance/update-dimension-tags/:id"
          element={withLayout(MainLayout, UpdateDimensionTagsForm)}
        />

        <Route
          path="/bankingandgeneralledger/transactions"
          element={withLayout(MainLayout, BankingTransactions)}
        />
        <Route
          path="/bankingandgeneralledger/inquiriesandreports"
          element={withLayout(MainLayout, BankingInquiriesAndReports)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance"
          element={withLayout(MainLayout, BankingMaintenance)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/bank-accounts"
          element={withLayout(MainLayout, BankAccountsTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-bank-accounts"
          element={withLayout(MainLayout, AddBankAccountsForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-bank-accounts/:id"
          element={withLayout(MainLayout, UpdateBankAccountsForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/account-tags"
          element={withLayout(MainLayout, AccountTagsTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-account-tags"
          element={withLayout(MainLayout, AddAccountTagsForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/exchange-rates"
          element={withLayout(MainLayout, ExchangeRateTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-exchange-rate"
          element={withLayout(MainLayout, AddExchangeRateForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-exchange-rate/:id"
          element={withLayout(MainLayout, UpdateExchangeRateForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/gl-accounts"
          element={withLayout(MainLayout, AddGlAccount)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-gl-account/:id"
          element={withLayout(MainLayout, UpdateGlAccount)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-account-tags/:id"
          element={withLayout(MainLayout, UpdateAccountTagsForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/currencies"
          element={withLayout(MainLayout, CurrenciesTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-currency"
          element={withLayout(MainLayout, AddCurrencies)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-currency/:id"
          element={withLayout(MainLayout, UpdateCurrencies)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/quick-entries"
          element={withLayout(MainLayout, QuickEntriesTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-quick-entry"
          element={withLayout(MainLayout, AddQuickEntriesForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-quick-entry"
          element={withLayout(MainLayout, UpdateQuickEntriesForm)}
        />

        <Route
          path="/bankingandgeneralledger/maintenance/gl-account-groups"
          element={withLayout(MainLayout, GlAccountGroupsTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-gl-account-groups"
          element={withLayout(MainLayout, AddGlAccountGroupsForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-gl-account-groups/:id"
          element={withLayout(MainLayout, UpdateGlAccountGroupsForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/gl-account-classes"
          element={withLayout(MainLayout, GlAccountClassesTable)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-gl-account-classes"
          element={withLayout(MainLayout, AddGlAccountClassesForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-gl-account-classes/:id"
          element={withLayout(MainLayout, UpdateGlAccountClassesForm)}
        />
        <Route
          path="/bankingandgeneralledger/maintenance/revaluation-of-currency-accounts"
          element={withLayout(MainLayout, RevaluateCurrenciesForm)}
        />

        <Route
          path="/setup/companysetup"
          element={withLayout(MainLayout, CompanySetup)}
        />
        <Route
          path="/setup/companysetup/company-setup"
          element={withLayout(MainLayout, CompanySetupForm)}
        />
        <Route
          path="/setup/companysetup/user-account-setup"
          element={withLayout(MainLayout, UserManagementTable)}
        />
        <Route
          path="/setup/companysetup/add-user"
          element={withLayout(MainLayout, AddUserForm)}
        />
        <Route
          path="/setup/companysetup/update-user/:id"
          element={withLayout(MainLayout, UpdateUserForm)}
        />
        <Route
          path="setup/companysetup/access-setup"
          element={withLayout(MainLayout, AddUserAccessForm)}
        />
        <Route
          path="setup/companysetup/edit-access-setup"
          element={withLayout(MainLayout, UpdateUserAccessForm)}
        />

        <Route
          path="/setup/companysetup/fiscal-years"
          element={withLayout(MainLayout, FiscalYearTable)}
        />
        <Route
          path="/setup/companysetup/add-fiscal-year"
          element={withLayout(MainLayout, AddFiscalYear)}
        />
        <Route
          path="/setup/companysetup/update-fiscal-year/:id"
          element={withLayout(MainLayout, UpdateFiscalYear)}
        />
        <Route
          path="/setup/companysetup/tax-groups"
          element={withLayout(MainLayout, TaxGroupsTable)}
        />
        <Route
          path="/setup/companysetup/add-tax-groups"
          element={withLayout(MainLayout, AddTaxGroupsForm)}
        />
        <Route
          path="/setup/companysetup/update-tax-groups/:id"
          element={withLayout(MainLayout, UpdateTaxGroupsForm)}
        />
        <Route
          path="/setup/companysetup/taxes"
          element={withLayout(MainLayout, TaxTypesTable)}
        />
        <Route
          path="/setup/companysetup/add-tax-types"
          element={withLayout(MainLayout, AddTaxTypes)}
        />
        <Route
          path="/setup/companysetup/update-tax-types/:id"
          element={withLayout(MainLayout, UpdateTaxTypes)}
        />
        <Route
          path="/setup/companysetup/item-tax-types"
          element={withLayout(MainLayout, ItemTaxTypesTable)}
        />
        <Route
          path="/setup/companysetup/add-item-tax-types"
          element={withLayout(MainLayout, AddItemTaxTypes)}
        />
        <Route
          path="/setup/companysetup/update-item-tax-types/:id"
          element={withLayout(MainLayout, UpdateItemTaxTypes)}
        />
        <Route
          path="/setup/companysetup/system-and-general-gl-setup"
          element={withLayout(MainLayout, SystemGLSetupForm)}
        />
        <Route
          path="/setup/companysetup/transaction-references"
          element={withLayout(MainLayout, TransactionReferencesTable)}
        />
        <Route
          path="/setup/companysetup/add-transaction-references"
          element={withLayout(MainLayout, AddTransactionReferencesForm)}
        />
        <Route
          path="/setup/companysetup/update-transaction-references"
          element={withLayout(MainLayout, UpdateTransactionReferencesForm)}
        />


        <Route
          path="/setup/miscellaneous"
          element={withLayout(MainLayout, Miscellaneous)}
        />
        <Route
          path="/setup/maintenance"
          element={withLayout(MainLayout, SetupMaintenance)}
        />
        <Route
          path="/setup/maintenance/install-chart-of-accounts"
          element={withLayout(MainLayout, InstallChartOfAccounts)}
        />
        <Route
          path="/setup/maintenance/void-a-transaction"
          element={withLayout(MainLayout, VoidTransactionTable)}
        />
        <Route
          path="/setup/maintenance/add-void-a-transaction"
          element={withLayout(MainLayout, VoidTransaction)}
        />
        <Route
          path="/setup/maintenance/view-or-print-transaction"
          element={withLayout(MainLayout, ViewPrintTransactions)}
        />
        <Route
          path="/setup/maintenance/attach-documents"
          element={withLayout(MainLayout, DocumentsTable)}
        />
        <Route
          path="/setup/maintenance/add-document"
          element={withLayout(MainLayout, AddDocumentsForm)}
        />
        <Route
          path="/setup/maintenance/update-document"
          element={withLayout(MainLayout, UpdateDocumentsForm)}
        />
        <Route
          path="/setup/maintenance/backup-and-restore"
          element={withLayout(MainLayout, BackupRestore)}
        />
        <Route
          path="/setup/maintenance/create-update-companies"
          element={withLayout(MainLayout, CompanyTable)}
        />
        <Route
          path="/setup/maintenance/add-company"
          element={withLayout(MainLayout, AddCompanyForm)}
        />
        <Route
          path="/setup/maintenance/update-company"
          element={withLayout(MainLayout, UpdateCompanyForm)}
        />
        <Route
          path="/setup/maintenance/install-languages"
          element={withLayout(MainLayout, LanguagesTable)}
        />
        <Route
          path="/setup/maintenance/add-language"
          element={withLayout(MainLayout, AddLanguagesForm)}
        />
        <Route
          path="/setup/maintenance/update-language"
          element={withLayout(MainLayout, UpdateLanguagesForm)}
        />
        <Route
          path="/setup/maintenance/install-extensions"
          element={withLayout(MainLayout, InstallExtensions)}
        />
        <Route
          path="/setup/maintenance/install-themes"
          element={withLayout(MainLayout, InstallThemes)}
        />
        <Route
          path="/setup/maintenance/software-upgrade"
          element={withLayout(MainLayout, SoftwareUpdateTable)}
        />
        <Route
          path="/setup/maintenance/system-diagnostics"
          element={withLayout(MainLayout, SystemDiagnostics)}
        />
        <Route
          path="/setup/miscellaneous/payment-terms"
          element={withLayout(MainLayout, PaymentTermsTable)}
        />
        <Route
          path="/setup/miscellaneous/add-payment-term"
          element={withLayout(MainLayout, AddPaymentTermsForm)}
        />
        <Route
          path="/setup/miscellaneous/update-payment-term/:id"
          element={withLayout(MainLayout, UpdatePaymentTermsForm)}
        />
        <Route
          path="/setup/miscellaneous/shipping-company"
          element={withLayout(MainLayout, ShippingCompanyTable)}
        />
        <Route
          path="/setup/miscellaneous/add-shipping-company"
          element={withLayout(MainLayout, AddShippingCompanyForm)}
        />
        <Route
          path="/setup/miscellaneous/contact-categories"
          element={withLayout(MainLayout, ContactCategoryTable)}
        />
        <Route
          path="/setup/miscellaneous/add-contact-category"
          element={withLayout(MainLayout, AddContactCategory)}
        />
        <Route
          path="/setup/miscellaneous/update-contact-category/:id"
          element={withLayout(MainLayout, UpdateContactCategory)}
        />
        <Route
          path="/setup/miscellaneous/update-shipping-company/:shipper_id"
          element={withLayout(MainLayout, UpdateShippingCompanyForm)}
        />
        <Route
          path="/setup/miscellaneous/printers"
          element={withLayout(MainLayout, PrintersTable)}
        />
        <Route
          path="/setup/miscellaneous/add-printer"
          element={withLayout(MainLayout, AddPrintersForm)}
        />
        <Route
          path="/setup/miscellaneous/update-printer"
          element={withLayout(MainLayout, UpdatePrintersForm)}
        />
        <Route
          path="/setup/miscellaneous/point-of-sale"
          element={withLayout(MainLayout, PosTable)}
        />
        <Route
          path="/setup/miscellaneous/add-point-of-sale"
          element={withLayout(MainLayout, AddPosForm)}
        />
        <Route
          path="/setup/miscellaneous/update-point-of-sale/"
          element={withLayout(MainLayout, UpdatePosForm)}
        />

        <Route
          path="/dashboard"
          element={withLayout(MainLayout, Dashboard)}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
