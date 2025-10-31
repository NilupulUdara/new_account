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
import AddSalesKitComponentPage from "./views/ItemsAndInventory/Maintenance/SalesKits/AddSalesKitComponentPage";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { PERMISSION_ID_MAP } from "./permissions/map";
import ReOrderLevelsTable from "./views/ItemsAndInventory/Maintenance/ReOrderLevels/ReOrderLevelsTable";
import ViewSalesPricing from "./views/ItemsAndInventory/PricingAndCosts/SalesPricing/ViewSalesPricing";
import ViewPurchasingPricing from "./views/ItemsAndInventory/PricingAndCosts/PurchasingPricing/ViewPurchasingPricing";
import ViewAddStandardCostForm from "./views/ItemsAndInventory/PricingAndCosts/StandardCosts/ViewAddStandardCostForm";
import AddPurchasingPricingForm2 from "./views/ItemsAndInventory/PricingAndCosts/PurchasingPricing/AddPurchasingPricingForm2";
import UpdatePurchasingPricingForm2 from "./views/ItemsAndInventory/PricingAndCosts/PurchasingPricing/UpdatePurchasingPricingForm2";
import AddSalesPricingForm2 from "./views/ItemsAndInventory/PricingAndCosts/SalesPricing/AddSalesPricingForm2";
import UpdateSalesPricingForm2 from "./views/ItemsAndInventory/PricingAndCosts/SalesPricing/UpdateSalesPricingForm2";

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

// Note: auth and permission checks are handled by `src/context/AuthContext` and
// `src/components/ProtectedRoute`. Use the component below to guard routes.

const AppRoutes = () => {
  const token = localStorage.getItem("token");
  const { data: user, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
    enabled: !!token, // Only run query if token exists
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);
  // console.log("user", user);
  return (
    <Routes>
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/register" element={withoutLayout(RegistrationPage)} />
  <Route path="/not-authorized" element={withLayout(MainLayout, PermissionDenied)} />
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

        <Route path="/setup" element={<ProtectedRoute required={PERMISSION_ID_MAP['Company Setup']} />}>
        <Route
          path="companysetup"
          element={withLayout(MainLayout, CompanySetup)}
        />
        <Route
          path="companysetup/company-setup"
          element={withLayout(MainLayout, CompanySetupForm)}
        />
        {/* <Route
          path="companysetup/user-account-setup"
          element={withLayout(MainLayout, UserManagementTable)}
        /> */}

        {/* users setup page - require Users setup permission */}
        <Route
          path="companysetup/user-account-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Users setup']}>
              {withLayout(MainLayout, UserManagementTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/add-user"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Users setup']}>
              {withLayout(MainLayout, AddUserForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/update-user/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Users setup']}>
              {withLayout(MainLayout, UpdateUserForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/access-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Access levels edition']}>
              {withLayout(MainLayout, AddUserAccessForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/edit-access-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Access levels edition']}>
              {withLayout(MainLayout, UpdateUserAccessForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/fiscal-years"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fiscal years maintenance']}>
              {withLayout(MainLayout, FiscalYearTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/add-fiscal-year"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fiscal years maintenance']}>
              {withLayout(MainLayout, AddFiscalYear)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/update-fiscal-year/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fiscal years maintenance']}>
              {withLayout(MainLayout, UpdateFiscalYear)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/tax-groups"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Tax groups']}>
              {withLayout(MainLayout, TaxGroupsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/add-tax-groups"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Tax groups']}>
              {withLayout(MainLayout, AddTaxGroupsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/update-tax-groups/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Tax groups']}>
              {withLayout(MainLayout, UpdateTaxGroupsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/taxes"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Tax rates']}>
              {withLayout(MainLayout, TaxTypesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/add-tax-types"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Tax rates']}>
              {withLayout(MainLayout, AddTaxTypes)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/update-tax-types/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Tax rates']}>
              {withLayout(MainLayout, UpdateTaxTypes)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/item-tax-types"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item tax type definitions']}>
              {withLayout(MainLayout, ItemTaxTypesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/add-item-tax-types"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item tax type definitions']}>
              {withLayout(MainLayout, AddItemTaxTypes)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/update-item-tax-types/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item tax type definitions']}>
              {withLayout(MainLayout, UpdateItemTaxTypes)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/system-and-general-gl-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Company GL setup']}>
              {withLayout(MainLayout, SystemGLSetupForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="companysetup/transaction-references"
          element={withLayout(MainLayout, TransactionReferencesTable)}
        />
        <Route
          path="companysetup/add-transaction-references"
          element={withLayout(MainLayout, AddTransactionReferencesForm)}
        />
        <Route
          path="companysetup/update-transaction-references"
          element={withLayout(MainLayout, UpdateTransactionReferencesForm)}
        />
        <Route path="miscellaneous" element={withLayout(MainLayout, Miscellaneous)} />

        <Route path="maintenance" element={<ProtectedRoute required={PERMISSION_ID_MAP['Special Maintenance']} />}>
          <Route
            path="install-chart-of-accounts"
            element={withLayout(MainLayout, InstallChartOfAccounts)}
          />
          <Route
            path="void-a-transaction"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Voiding transactions']}>
                {withLayout(MainLayout, VoidTransactionTable)}
              </ProtectedRoute>
            }
          />
          <Route
            path="add-void-a-transaction"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Voiding transactions']}>
                {withLayout(MainLayout, VoidTransaction)}
              </ProtectedRoute>
            }
          />
          <Route
            path="view-or-print-transaction"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Common view/print transactions interface']}>
                {withLayout(MainLayout, ViewPrintTransactions)}
              </ProtectedRoute>
            }
          />
          <Route
            path="attach-documents"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Attaching documents']}>
                {withLayout(MainLayout, DocumentsTable)}
              </ProtectedRoute>
            }
          />
          <Route
            path="add-document"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Attaching documents']}>
                {withLayout(MainLayout, AddDocumentsForm)}
              </ProtectedRoute>
            }
          />
          <Route
            path="update-document"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Attaching documents']}>
                {withLayout(MainLayout, UpdateDocumentsForm)}
              </ProtectedRoute>
            }
          />
          <Route
            path="backup-and-restore"
            element={
              <ProtectedRoute required={PERMISSION_ID_MAP['Database backup/restore']}>
                {withLayout(MainLayout, BackupRestore)}
              </ProtectedRoute>
            }
          />
          <Route
            path="create-update-companies"
            element={withLayout(MainLayout, CompanyTable)}
          />
          <Route
            path="add-company"
            element={withLayout(MainLayout, AddCompanyForm)}
          />
          <Route
            path="update-company"
            element={withLayout(MainLayout, UpdateCompanyForm)}
          />
          <Route
            path="install-languages"
            element={withLayout(MainLayout, LanguagesTable)}
          />
          <Route
            path="add-language"
            element={withLayout(MainLayout, AddLanguagesForm)}
          />
          <Route
            path="update-language"
            element={withLayout(MainLayout, UpdateLanguagesForm)}
          />
          <Route
            path="install-extensions"
            element={withLayout(MainLayout, InstallExtensions)}
          />
          <Route
            path="install-themes"
            element={withLayout(MainLayout, InstallThemes)}
          />
          <Route
            path="software-upgrade"
            element={withLayout(MainLayout, SoftwareUpdateTable)}
          />
          <Route
            path="system-diagnostics"
            element={withLayout(MainLayout, SystemDiagnostics)}
          />
        </Route>
        <Route
          path="miscellaneous/payment-terms"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Payment terms']}>
              {withLayout(MainLayout, PaymentTermsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/add-payment-term"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Payment terms']}>
              {withLayout(MainLayout, AddPaymentTermsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/update-payment-term/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Payment terms']}>
              {withLayout(MainLayout, UpdatePaymentTermsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/shipping-company"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Shipping ways']}>
              {withLayout(MainLayout, ShippingCompanyTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/add-shipping-company"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Shipping ways']}>
              {withLayout(MainLayout, AddShippingCompanyForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/contact-categories"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Contact categories']}>
              {withLayout(MainLayout, ContactCategoryTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/add-contact-category"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Contact categories']}>
              {withLayout(MainLayout, AddContactCategory)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/update-contact-category/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Contact categories']}>
              {withLayout(MainLayout, UpdateContactCategory)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/update-shipping-company/:shipper_id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Shipping ways']}>
              {withLayout(MainLayout, UpdateShippingCompanyForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/printers"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Printers configuration']}>
              {withLayout(MainLayout, PrintersTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/add-printer"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Printers configuration']}>
              {withLayout(MainLayout, AddPrintersForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/update-printer"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Printers configuration']}>
              {withLayout(MainLayout, UpdatePrintersForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/point-of-sale"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Point of Sale definitions']}>
              {withLayout(MainLayout, PosTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/add-point-of-sale"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Point of Sale definitions']}>
              {withLayout(MainLayout, AddPosForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="miscellaneous/update-point-of-sale/"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Point of Sale definitions']}>
              {withLayout(MainLayout, UpdatePosForm)}
            </ProtectedRoute>
          }
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/maintenance" element={<ProtectedRoute required={PERMISSION_ID_MAP['Special Maintenance']} />} />
        <Route
          path="/sales/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales Transactions']}>
              {withLayout(MainLayout, SalesTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/transactions/sales-quotation-entry"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales quotations']}>
              {withLayout(MainLayout, SalesQuotationEntry)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales Related Reports']}>
              {withLayout(MainLayout, InquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales Configuration']}>
              {withLayout(MainLayout, Maintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, AddManageCutomers)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/general-settings"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, GeneralSettingsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/update-customer/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, UpdateGeneralSettingsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/contacts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, CustomersContactsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/add-customers-contacts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, AddCustomersContactsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/update-customers-contacts/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, UpdateCustomersContactsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, TransactionsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/sales-orders"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, SalesOrdersTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, AttachmentsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/add-attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, AddAttachmentsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/add-and-manage-customers/update-attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, UpdateAttachmentsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, CustomersBranches)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/general-settings"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, CustomerBranchesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/add-general-settings/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, AddCustomerBranchesGeneralSettingForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/update-general-settings/:branchCode"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, UpdateCustomerBranchesGeneralSettingForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/edit/:branchCode"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, CustomersBranches)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/branches-contacts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, ContactsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/add-customer-branches-contacts/"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, AddContactsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/customer-branches/update-customer-branches-contacts/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales customer and branches changes']}>
              {withLayout(MainLayout, UpdateContactsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-groups"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales groups changes']}>
              {withLayout(MainLayout, SalesGroupsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-groups/add-sales-groups"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales groups changes']}>
              {withLayout(MainLayout, AddSalesGroupsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-groups/update-sales-groups/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales groups changes']}>
              {withLayout(MainLayout, UpdateSalesGroupsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-persons"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales staff maintenance']}>
              {withLayout(MainLayout, SalesPersonTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-persons/add-sales-person"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales staff maintenance']}>
              {withLayout(MainLayout, AddSalesPerson)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-persons/update-sales-person/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales staff maintenance']}>
              {withLayout(MainLayout, UpdateSalesPerson)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-areas"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales areas maintenance']}>
              {withLayout(MainLayout, SalesAreaTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-areas/add-sales-area"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales areas maintenance']}>
              {withLayout(MainLayout, AddSalesAreaForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-areas/update-sales-area/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales areas maintenance']}>
              {withLayout(MainLayout, UpdateSalesAreaForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-types/"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales types']}>
              {withLayout(MainLayout, SalesTypesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-areas/add-sales-types"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales types']}>
              {withLayout(MainLayout, AddSalesTypesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/sales-areas/update-sales-types/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales types']}>
              {withLayout(MainLayout, UpdateSalesTypesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/credit-status-setup"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Credit status definitions changes']}>
              {withLayout(MainLayout, CreditStatusTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/credit-status-setup/add-credit-status"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Credit status definitions changes']}>
              {withLayout(MainLayout, AddCreditStatusForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/maintenance/credit-status-setup/update-credit-status/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Credit status definitions changes']}>
              {withLayout(MainLayout, UpdateCreditStatusForm)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase Transactions']}>
              {withLayout(MainLayout, PurchaseTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase Analytics']}>
              {withLayout(MainLayout, PurchaseInquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase Configuration']}>
              {withLayout(MainLayout, PurchaseMaintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, Suppliers)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/general-settings"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, SupplierGeneralSettingsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/update/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, UpdateSupplierGeneralSettingsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/contacts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, SuppliersContactsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/add-supplier-contact/"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, AddSuppliersContactsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/update-supplier-contact/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, UpdateSuppliersContactsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, SuppliersAttachmentsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/add-attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, AddSuppliersAttachmentsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/update-attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, UpdateSuppliersAttachmentsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, SuppliersTransactionsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/maintenance/suppliers/purchases-orders"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Suppliers changes']}>
              {withLayout(MainLayout, SupplierPurchaseOrdersTable)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/itemsandinventory/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory Operations']}>
              {withLayout(MainLayout, ItemsTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory Analytics']}>
              {withLayout(MainLayout, ItemsInquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory Configuration']}>
              {withLayout(MainLayout, ItemsMaintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/units-of-measure"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Units of measure']}>
              {withLayout(MainLayout, UnitsOfMeasureTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/units-of-measure/add-units-of-measure"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Units of measure']}>
              {withLayout(MainLayout, AddUnitsOfMeasureForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/units-of-measure/update-units-of-measure/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Units of measure']}>
              {withLayout(MainLayout, UpdateUnitsOfMeasureForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock items add/edit']}>
              {withLayout(MainLayout, Items)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/general-settings"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock items add/edit']}>
              {withLayout(MainLayout, ItemsGeneralSettingsForm)}
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/itemsandinventory/maintenance/items/sales-pricing"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales prices edition']}>
              {withLayout(MainLayout, SalesPricingTable)}
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/itemsandinventory/maintenance/items/add-sales-pricing/:itemId"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales prices edition']}>
              {withLayout(MainLayout, AddSalesPricingForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/update-sales-pricing/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales prices edition']}>
              {withLayout(MainLayout, UpdateSalesPricingForm)}
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/itemsandinventory/maintenance/items/purchasing-pricing"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase price changes']}>
              {withLayout(MainLayout, PurchasingPricingTable)}
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/itemsandinventory/maintenance/items/add-purchasing-pricing/:itemId"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase price changes']}>
              {withLayout(MainLayout, AddPurchasingPricingForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/update-purchasing-pricing/:supplierId/:stockId"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase price changes']}>
              {withLayout(MainLayout, UpdatePurchasePricingForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/standard-costs"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item standard costs']}>
              {withLayout(MainLayout, AddStandardCostForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/reorder-levels"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Reorder levels']}>
              {withLayout(MainLayout, ReOrderLevelsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock transactions view']}>
              {withLayout(MainLayout, ItemTransactionsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/status"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock status view']}>
              {withLayout(MainLayout, StatusTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock items add/edit']}>
              {withLayout(MainLayout, ItemAttachmentsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/add-attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock items add/edit']}>
              {withLayout(MainLayout, AddItemAttachmentsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/items/update-attachments"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Stock items add/edit']}>
              {withLayout(MainLayout, UpdateItemAttachmentsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/update-units-of-measure"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Units of measure']}>
              {withLayout(MainLayout, UpdateUnitsOfMeasureForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/foreign-item-codes"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Foreign item codes entry']}>
              {withLayout(MainLayout, ForeignItemCodesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/add-foreign-item-codes"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Foreign item codes entry']}>
              {withLayout(MainLayout, AddForeignItemCodesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/update-foreign-item-codes"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Foreign item codes entry']}>
              {withLayout(MainLayout, UpdateForeignItemCodesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/sales-kits"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales kits']}>
              {withLayout(MainLayout, AddSalesKitsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/add-saleskit-component"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales kits']}>
              {withLayout(MainLayout, AddSalesKitComponentPage)}
            </ProtectedRoute>
          }
        />
        

        <Route
          path="/itemsandinventory/maintenance/inventory-locations"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory locations changes']}>
              {withLayout(MainLayout, InventoryLocationTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/add-inventory-location"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory locations changes']}>
              {withLayout(MainLayout, AddInventoryLocationForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/update-inventory-location/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory locations changes']}>
              {withLayout(MainLayout, UpdateInventoryLocationForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/item-categories"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item categories']}>
              {withLayout(MainLayout, ItemCategoriesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/add-item-categories"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item categories']}>
              {withLayout(MainLayout, AddItemCategoriesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/update-item-categories/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item categories']}>
              {withLayout(MainLayout, UpdateItemCategoriesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/maintenance/reorder-levels"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Reorder levels']}>
              {withLayout(MainLayout, ReOrderLevelsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/sales-pricing"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales prices edition']}>
              {withLayout(MainLayout, ViewSalesPricing)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/add-sales-pricing/:itemId"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales prices edition']}>
              {withLayout(MainLayout, AddSalesPricingForm2)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/update-sales-pricing/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Sales prices edition']}>
              {withLayout(MainLayout, UpdateSalesPricingForm2)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/purchasing-pricing"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase price changes']}>
              {withLayout(MainLayout, ViewPurchasingPricing)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/add-purchasing-pricing/:itemId"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase price changes']}>
              {withLayout(MainLayout, AddPurchasingPricingForm2)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/update-purchasing-pricing/:supplierId/:stockId"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Purchase price changes']}>
              {withLayout(MainLayout, UpdatePurchasingPricingForm2)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/itemsandinventory/pricingandcosts/standard-costs"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Item standard costs']}>
              {withLayout(MainLayout, ViewAddStandardCostForm)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/itemsandinventory/pricingandcosts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Inventory Configuration']}>
              {withLayout(MainLayout, ItemsPricingAndCosts)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturing/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Manufacturing Transactions']}>
              {withLayout(MainLayout, ManufacturingTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturing/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Manufacturing Analytics']}>
              {withLayout(MainLayout, ManufacturingInquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturing/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Manufacturing Configuration']}>
              {withLayout(MainLayout, ManufacturingMaintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturing/maintenance/work-centres"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Manufacture work centres']}>
              {withLayout(MainLayout, WorkCentresTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturing/maintenance/add-work-centres"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Manufacture work centres']}>
              {withLayout(MainLayout, AddWorkCentresForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturing/maintenance/update-work-centres/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Manufacture work centres']}>
              {withLayout(MainLayout, UpdateWorkCentresForm)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/fixedassets/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fixed Assets Operations']}>
              {withLayout(MainLayout, FixedAssestsTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/fixedassets/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fixed Assets Analytics']}>
              {withLayout(MainLayout, FixedAssestsInquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/fixedassets/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fixed Assets Configuration']}>
              {withLayout(MainLayout, FixedAssestsMaintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/fixedassets/maintenance/fixed-asset-locations"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fixed Asset items add/edit']}>
              {withLayout(MainLayout, FixedAssetsLocationsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/fixedassets/maintenance/add-fixed-asset-location"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fixed Asset items add/edit']}>
              {withLayout(MainLayout, AddFixedAssetsLocations)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/fixedassets/maintenance/update-fixed-asset-location/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Fixed Asset items add/edit']}>
              {withLayout(MainLayout, UpdateFixedAssetsLocations)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/dimension/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Dimensions']}>
              {withLayout(MainLayout, DimensionTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/dimension/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Dimension reports']}>
              {withLayout(MainLayout, DimensionInquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/dimension/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Dimensions Configuration']}>
              {withLayout(MainLayout, DimensionMaintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/dimension/maintenance/dimension-tags"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Dimension tags']}>
              {withLayout(MainLayout, DimensionTagsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/dimension/maintenance/add-dimension-tags"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Dimension tags']}>
              {withLayout(MainLayout, AddDimensionTagsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/dimension/maintenance/update-dimension-tags/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Dimension tags']}>
              {withLayout(MainLayout, UpdateDimensionTagsForm)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/bankingandgeneralledger/transactions"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Banking & GL Transactions']}>
              {withLayout(MainLayout, BankingTransactions)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/inquiriesandreports"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Banking & GL Analytics']}>
              {withLayout(MainLayout, BankingInquiriesAndReports)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Banking & GL Configuration']}>
              {withLayout(MainLayout, BankingMaintenance)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/bank-accounts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank accounts']}>
              {withLayout(MainLayout, BankAccountsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-bank-accounts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank accounts']}>
              {withLayout(MainLayout, AddBankAccountsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-bank-accounts/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Bank accounts']}>
              {withLayout(MainLayout, UpdateBankAccountsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/account-tags"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL Account tags']}>
              {withLayout(MainLayout, AccountTagsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-account-tags"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL Account tags']}>
              {withLayout(MainLayout, AddAccountTagsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/exchange-rates"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Exchange rate table changes']}>
              {withLayout(MainLayout, ExchangeRateTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-exchange-rate"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Exchange rate table changes']}>
              {withLayout(MainLayout, AddExchangeRateForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-exchange-rate/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Exchange rate table changes']}>
              {withLayout(MainLayout, UpdateExchangeRateForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/gl-accounts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL accounts edition']}>
              {withLayout(MainLayout, AddGlAccount)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-gl-account/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL accounts edition']}>
              {withLayout(MainLayout, UpdateGlAccount)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-account-tags/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL Account tags']}>
              {withLayout(MainLayout, UpdateAccountTagsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/currencies"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Currencies']}>
              {withLayout(MainLayout, CurrenciesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-currency"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Currencies']}>
              {withLayout(MainLayout, AddCurrencies)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-currency/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Currencies']}>
              {withLayout(MainLayout, UpdateCurrencies)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/quick-entries"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Quick GL entry definitions']}>
              {withLayout(MainLayout, QuickEntriesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-quick-entry"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Quick GL entry definitions']}>
              {withLayout(MainLayout, AddQuickEntriesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-quick-entry"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Quick GL entry definitions']}>
              {withLayout(MainLayout, UpdateQuickEntriesForm)}
            </ProtectedRoute>
          }
        />

        <Route
          path="/bankingandgeneralledger/maintenance/gl-account-groups"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL account groups']}>
              {withLayout(MainLayout, GlAccountGroupsTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-gl-account-groups"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL account groups']}>
              {withLayout(MainLayout, AddGlAccountGroupsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-gl-account-groups/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL account groups']}>
              {withLayout(MainLayout, UpdateGlAccountGroupsForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/gl-account-classes"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL account classes']}>
              {withLayout(MainLayout, GlAccountClassesTable)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/add-gl-account-classes"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL account classes']}>
              {withLayout(MainLayout, AddGlAccountClassesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/update-gl-account-classes/:id"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['GL account classes']}>
              {withLayout(MainLayout, UpdateGlAccountClassesForm)}
            </ProtectedRoute>
          }
        />
        <Route
          path="/bankingandgeneralledger/maintenance/revaluation-of-currency-accounts"
          element={
            <ProtectedRoute required={PERMISSION_ID_MAP['Exchange rate table changes']}>
              {withLayout(MainLayout, RevaluateCurrenciesForm)}
            </ProtectedRoute>
          }
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
