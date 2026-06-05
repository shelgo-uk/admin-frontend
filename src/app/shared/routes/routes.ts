import { Routes } from "@angular/router";
import { DashboardComponent } from "../../components/dashboard/dashboard.component";
import { UsersComponent } from "../../components/users/users.component";
import { SiteConfigurationComponent } from "../../components/site-configuration/site-configuration.component";
import { HomeBannersComponent } from "../../components/home-banners/home-banners.component";
import { CategoriesComponent } from "../../components/categories/categories.component";
import { BrandsComponent } from "../../components/brands/brands.component";
import { ProductsComponent } from "../../components/products/products.component";
import { AddUpdateProductsComponent } from "../../components/products/add-update-products/add-update-products.component";
import { CustomersComponent } from "../../components/customers/customers.component";
import { PaymentSettingsComponent } from "../../components/payment-settings/payment-settings.component";
import { OrdersComponent } from "../../components/orders/orders.component";
import { PromoBannersComponent } from "../../components/promo-banners/promo-banners.component";
import { CategoryPageBuilderComponent } from "../../components/category-page-builder/category-page-builder.component";
import { PoliciesComponent } from "../../components/policies/policies.component";
import { FaqAdminComponent } from "../../components/faq/faq.component";
import { ContactLeadsComponent } from "../../components/contact-leads/contact-leads.component";

export const routing: Routes = [
    { path: '', redirectTo: '', pathMatch: "full" },
    { path: '', component: DashboardComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'users', component: UsersComponent },
    { path: 'customers', component: CustomersComponent },
    { path: 'site-configuration', component: SiteConfigurationComponent },
    { path: 'home-banners', component: HomeBannersComponent },
    { path: 'promo-banners', component: PromoBannersComponent },
    { path: 'category-page-builder', component: CategoryPageBuilderComponent },
    { path: 'policies', component: PoliciesComponent },
    { path: 'faq', component: FaqAdminComponent },
    { path: 'contact-leads', component: ContactLeadsComponent },
    { path: 'categories', component: CategoriesComponent },
    { path: 'brands', component: BrandsComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'products/add', component: AddUpdateProductsComponent },
    { path: 'products/edit/:id', component: AddUpdateProductsComponent },
    { path: 'payment-settings', component: PaymentSettingsComponent },
    { path: 'orders', component: OrdersComponent },
    { path: '**', redirectTo: 'dashboard', pathMatch: "full" },
]
