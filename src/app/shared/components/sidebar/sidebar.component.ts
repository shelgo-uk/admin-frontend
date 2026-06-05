import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  sidebarPages: any[] = [
    {
      category : "Overview",
      pages : [
        {
          pagename : "Dashboard",
          icon : "grid-2",
          url : "/dashboard",
        }
      ]
    },
    {
      category : "Administrator",
      pages : [
        {
          pagename : "Users",
          icon : "users",
          url : "/users"
        },
        {
          pagename : "Customers",
          icon : "user-group",
          url : "/customers"
        },
        {
          pagename : "Site Configuration",
          icon : "gears",
          url : "/site-configuration"
        }
      ]
    },
    {
      category : "Content",
      pages : [
        {
          pagename : "Home Banners",
          icon : "image",
          url : "/home-banners"
        },
        {
          pagename : "Promo Banners",
          icon : "grid-2",
          url : "/promo-banners"
        },
        {
          pagename : "Category Pages",
          icon : "layer-group",
          url : "/category-page-builder"
        },
        {
          pagename : "Policies / CMS",
          icon : "file-lines",
          url : "/policies"
        },
        {
          pagename : "FAQ Manager",
          icon : "circle-question",
          url : "/faq"
        },
        {
          pagename : "Contact Leads",
          icon : "envelope",
          url : "/contact-leads"
        }
      ]
    },
    {
      category : "Business",
      pages : [
        {
          pagename : "Categories",
          icon : "folder-tree",
          url : "/categories"
        },
        {
          pagename : "Brands",
          icon : "tag",
          url : "/brands"
        },
        {
          pagename : "Products",
          icon : "box",
          url : "/products"
        },
        {
          pagename : "Orders",
          icon : "bag-shopping",
          url : "/orders"
        }
      ]
    },
    {
      category : "Settings",
      pages : [
        {
          pagename : "Payment Settings",
          icon : "credit-card",
          url : "/payment-settings"
        }
      ]
    }
  ];

  constructor(
    public sharedservice: SharedService,
    public router: Router,
  ) { }
  ngOnInit(): void {
  }

  logout() {
    localStorage.removeItem('admin_data');
    localStorage.clear();
    this.router.navigate(['/'])
  }

}
