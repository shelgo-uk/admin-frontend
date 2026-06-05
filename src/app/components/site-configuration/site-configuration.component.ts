import { Component } from '@angular/core';
import { siteConfigReqModel } from './site-configuration.model';
import { SharedService } from '../../shared/services/shared.service';
import { SiteConfigService } from './site-configuration.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-site-configuration',
  templateUrl: './site-configuration.component.html',
  styleUrl: './site-configuration.component.scss'
})
export class SiteConfigurationComponent {
  isDataLoaded : boolean = false;
  siteConfig : siteConfigReqModel = new siteConfigReqModel();
 
  constructor(
    public sharedservice : SharedService,
    private siteconfigservice : SiteConfigService,
    private modalService: NgbModal
  ){}

  ngOnInit(): void {
    this.getSiteConfig();
  }
  
  getSiteConfig(){
    this.siteconfigservice.getSiteConfig().subscribe((res : any) => {
      let config = res.data[0];
      this.siteConfig.logo = config.logo;
      this.siteConfig.whiteLogo = config.whiteLogo;
      this.siteConfig.icon = config.icon;
      this.siteConfig.siteName = config.siteName;
      this.siteConfig.clientUrl = config.clientUrl;
      this.siteConfig.mobile = config.mobile;
      this.siteConfig.email = config.email;
      this.siteConfig.currency = config.currency || '£';
      this.siteConfig.deliveryCharge = config.deliveryCharge ?? 20;

      this.siteConfig.facebookURL = config.facebookURL;
      this.siteConfig.instagramURL = config.instagramURL;
      this.siteConfig.linkedInURL = config.linkedInURL;
      this.siteConfig.twitterURL = config.twitterURL;
      this.siteConfig.youtubeURL = config.youtubeURL;
      this.isDataLoaded = true;

      // Update shared service so currency is available globally in ADMIN
      this.sharedservice.siteConfig = config;
    })
  }
  
  updateSiteConfig(){
    let errTxt = '';

    if (!this.siteConfig.logo) {
      errTxt += 'Upload Logo <br/>';
    }
    if (!this.siteConfig.whiteLogo) {
      errTxt += 'Upload White Logo <br/>';
    }
    if (!this.siteConfig.icon) {
      errTxt += 'Upload Icon <br/>';
    }
    if (!this.siteConfig.siteName) {
      errTxt += 'Enter Site Name <br/>';
    }
    if (!this.siteConfig.clientUrl) {
      errTxt += 'Enter Client Url <br/>';
    }
    if (!this.siteConfig.mobile) {
      errTxt += 'Enter Mobile <br/>';
    }
    if (!this.siteConfig.email) {
      errTxt += 'Enter Email <br/>';
    }else{
      if (String(this.siteConfig.email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) { } else {
        errTxt += 'Enter Valid Email<br/>';
      }
    }
    if (!this.siteConfig.instagramURL) {
      errTxt += 'Enter Instagram URL <br/>';
    }
    if (!this.siteConfig.facebookURL) {
      errTxt += 'Enter Facebook URL <br/>';
    }
    if (!this.siteConfig.twitterURL) {
      errTxt += 'Enter Twitter URL <br/>';
    }
    if (!this.siteConfig.linkedInURL) {
      errTxt += 'Enter Linkedin URL <br/>';
    }
    if (!this.siteConfig.youtubeURL) {
      errTxt += 'Enter Youtube URL <br/>';
    }
    
    if (errTxt == '') {
      this.siteconfigservice.updateSiteConfig(this.siteConfig).subscribe((res : any) => {
        if(res){
          this.sharedservice.showAlert(1,'Configuration Updated Successfully');
        }else{
          this.sharedservice.showAlert(2,'Something Went Wrong')
        }
      }, err => {
        this.sharedservice.showAlert(2,'Technical Issue Found !')
      })
    } else {
      this.sharedservice.showAlert(2, errTxt);
    }
  }

  private openUploadModal(options: { directory: string; dimentions?: { width: number; height: number } }) {
    const modalRef = this.modalService.open(FileUploadComponent, { centered: true, size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.directory = options.directory;
    modalRef.componentInstance.dimentions = options.dimentions;
    modalRef.componentInstance.type = 'image';
    return modalRef;
  }

  uploadImage() {
    const modalRef = this.openUploadModal({ directory: 'siteconfig'});
    modalRef.result.then((result: any) => {
      if (result?.status && result?.url) {
        this.siteConfig.logo = result.url;
      }
    }).catch(() => {});
  }

  uploadwhiteLogo() {
    const modalRef = this.openUploadModal({ directory: 'siteconfig'});
    modalRef.result.then((result: any) => {
      if (result?.status && result?.url) {
        this.siteConfig.whiteLogo = result.url;
      }
    }).catch(() => {});
  }

  uploadIcon() {
    const modalRef = this.openUploadModal({ directory: 'siteconfig', dimentions: { width: 512, height: 512 } });
    modalRef.result.then((result: any) => {
      if (result?.status && result?.url) {
        this.siteConfig.icon = result.url;
      }
    }).catch(() => {});
  }
}
