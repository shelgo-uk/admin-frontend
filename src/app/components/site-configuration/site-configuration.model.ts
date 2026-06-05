export class siteConfigReqModel{
    siteName : string;
    clientUrl : string;
    logo : string;
    whiteLogo : string;
    icon : string;
    mobile : string;
    email : string;
    currency : string = '£';
    deliveryCharge : number = 20;

    instagramURL : string;
    facebookURL : string;
    twitterURL : string;
    linkedInURL : string;
    youtubeURL : string;

    enablePlayerLogin : boolean;
}