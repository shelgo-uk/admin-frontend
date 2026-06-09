import { environment } from "../environment/environment";

export let urlConstant: any = {};

export function rebuildUrlConstant() {
  urlConstant = {
    LoginAPI: {
      loginAdministrator: environment.APIUrl + 'users/loginUser',
    },
    FilesAPI: {
      fileUpload: environment.APIUrl + 'file/upload',
      deleteFile: environment.APIUrl + 'file/deleteFile/',
      getFoldersByPath: environment.APIUrl + 'file/getFoldersByPath',
      getFilesByPath: environment.APIUrl + 'file/getFilesByPath',
    },
    DashboardAPI: {
      dashboard: environment.APIUrl + 'dashboard/dashboard',
    },
    SiteConfigAPI: {
      getSiteConfig: environment.APIUrl + 'siteconfig/getSiteconfig',
      updateSiteConfig: environment.APIUrl + 'siteconfig/updateSiteconfig/1',
    },
    UsersAPI: {
      getUsers: environment.APIUrl + 'users/getAllUsers',
      getAllUsersByPage: environment.APIUrl + 'users/getAllUsersByPage',
      addUser: environment.APIUrl + 'users/createUser',
      updateUser: environment.APIUrl + 'users/updateUser/',
      updateUserStatus: environment.APIUrl + 'users/updateUserStatus/',
      deleteUser: environment.APIUrl + 'users/deleteUser/',
    },
    HomeBannerAPI: {
      getAllByPage: environment.APIUrl + 'homebanner/getAllBannersByPage',
      create: environment.APIUrl + 'homebanner/createBanner',
      update: environment.APIUrl + 'homebanner/updateBanner/',
      updateStatus: environment.APIUrl + 'homebanner/updateBannerStatus/',
      delete: environment.APIUrl + 'homebanner/deleteBanner/',
    },
    CategoryAPI: {
      getAllByPage: environment.APIUrl + 'category/getAllCategoriesByPage',
      getAll: environment.APIUrl + 'category/getAllCategories',
      getChildren: environment.APIUrl + 'category/getChildren',
      create: environment.APIUrl + 'category/createCategory',
      update: environment.APIUrl + 'category/updateCategory/',
      updateStatus: environment.APIUrl + 'category/updateCategoryStatus/',
      delete: environment.APIUrl + 'category/deleteCategory/',
    },
    BrandAPI: {
      getAllByPage: environment.APIUrl + 'brand/getAllBrandsByPage',
      getAll: environment.APIUrl + 'brand/getAllBrands',
      create: environment.APIUrl + 'brand/createBrand',
      update: environment.APIUrl + 'brand/updateBrand/',
      updateStatus: environment.APIUrl + 'brand/updateBrandStatus/',
      delete: environment.APIUrl + 'brand/deleteBrand/',
    },
    ProductAPI: {
      getAllByPage: environment.APIUrl + 'product/getAllProductsByPage',
      getById: environment.APIUrl + 'product/getProductById/',
      create: environment.APIUrl + 'product/createProduct',
      update: environment.APIUrl + 'product/updateProduct/',
      updateStatus: environment.APIUrl + 'product/updateProductStatus/',
      delete: environment.APIUrl + 'product/deleteProduct/',
      getAllReviews: environment.APIUrl + 'product/getAllReviews',
      updateReviewStatus: environment.APIUrl + 'product/updateReviewStatus/',
      deleteReview: environment.APIUrl + 'product/deleteReview/',
      exportProducts: environment.APIUrl + 'product/exportProducts',
      bulkImport: environment.APIUrl + 'product/bulkImportProducts',
    },
    CustomerAPI: {
      getAllByPage: environment.APIUrl + 'customer/getAllByPage',
      create: environment.APIUrl + 'customer/createCustomer',
      update: environment.APIUrl + 'customer/updateCustomer/',
      updateStatus: environment.APIUrl + 'customer/updateStatus/',
      delete: environment.APIUrl + 'customer/deleteCustomer/',
    },
    CustomerAddressAPI: {
      getByCustomerId: environment.APIUrl + 'customer-address/admin/',
    },
    PaymentSettingsAPI: {
      getAdmin: environment.APIUrl + 'payment-settings/admin',
      update: environment.APIUrl + 'payment-settings/update',
    },
    OrderAPI: {
      getAllOrders: environment.APIUrl + 'orders/getAllOrders',
      updateStatus: environment.APIUrl + 'orders/updateStatus/',
      getById: environment.APIUrl + 'orders/getById/',
    },
    PromoBannerAPI: {
      getAll:   environment.APIUrl + 'promo-banners/getAll',
      saveAll:  environment.APIUrl + 'promo-banners/saveAll',
    },
    CategoryPageAPI: {
      getAll:   environment.APIUrl + 'category-page/admin/all',
      getAdmin: environment.APIUrl + 'category-page/admin/',
      save:     environment.APIUrl + 'category-page/save/',
    },
    PolicyAPI: {
      getAll:    environment.APIUrl + 'policies/getAll',
      getBySlug: environment.APIUrl + 'policies/',
      save:      environment.APIUrl + 'policies/save/',
    },
    FaqAPI: {
      getAdminCategories: environment.APIUrl + 'faq/admin/categories',
      createCategory:     environment.APIUrl + 'faq/admin/categories',
      updateCategory:     environment.APIUrl + 'faq/admin/categories/',
      deleteCategory:     environment.APIUrl + 'faq/admin/categories/',
      getArticles:        environment.APIUrl + 'faq/admin/categories/',
      createArticle:      environment.APIUrl + 'faq/admin/articles',
      updateArticle:      environment.APIUrl + 'faq/admin/articles/',
      deleteArticle:      environment.APIUrl + 'faq/admin/articles/',
    },
    ContactAPI: {
      getLeads:      environment.APIUrl + 'contact/admin/leads',
      updateStatus:  environment.APIUrl + 'contact/admin/',
      delete:        environment.APIUrl + 'contact/admin/',
    },
  };
}

rebuildUrlConstant();