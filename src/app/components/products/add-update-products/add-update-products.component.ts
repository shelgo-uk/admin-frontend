import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../../shared/services/shared.service';
import { ProductsService } from '../products.service';
import { CategoriesService } from '../../categories/categories.service';
import { BrandsService } from '../../brands/brands.service';
import { ProductReqModel } from '../products.model';

@Component({
    selector: 'app-add-update-products',
    standalone: false,
    templateUrl: './add-update-products.component.html',
    styleUrl: './add-update-products.component.scss'
})
export class AddUpdateProductsComponent implements OnInit {

    isEdit = false;
    productId: number | null = null;
    isPageLoading = false;
    isSubmitting = false;

    model = new ProductReqModel();

    allCategories: any[] = [];
    allBrands: any[] = [];

    // Variant inputs
    newVariantName = '';
    newOptionLabel: { [vi: number]: string } = {};
    newOptionStock: { [vi: number]: number } = {};

    // Tag input
    newTag = '';
    newImageUrl = '';

    // Active section for sticky nav
    activeSection = 'basic';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public sharedservice: SharedService,
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private brandsService: BrandsService
    ) {}

    ngOnInit(): void {
        this.loadMeta();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = true;
            this.productId = +id;
            this.loadProduct(this.productId);
        }
    }

    loadMeta() {
        this.categoriesService.getAll().subscribe((res: any) => { this.allCategories = res.data || []; });
        this.brandsService.getAll().subscribe((res: any) => { this.allBrands = res.data || []; });
    }

    loadProduct(id: number) {
        this.isPageLoading = true;
        this.productsService.getById(id).subscribe(
            (res: any) => {
                const d = res.data;
                if (!d) { this.router.navigate(['/products']); return; }
                this.model.name        = d.name;
                this.model.slug        = d.slug || '';
                this.model.description = d.description || '';
                this.model.price       = d.price || 0;
                this.model.salePrice   = d.salePrice || null;
                this.model.categoryId  = d.categoryId || null;
                this.model.brandId     = d.brandId || null;
                this.model.images      = [...(d.images || [])];
                this.model.variants    = JSON.parse(JSON.stringify(d.variants || []));
                this.model.tags        = [...(d.tags || [])];
                this.model.isActive    = !!d.isActive;
                this.model.sortOrder   = d.sortOrder || 0;
                this.model.avgRating   = parseFloat(d.avgRating) || 0;
                this.model.reviewCount = d.reviewCount || 0;
                this.isPageLoading = false;
            },
            () => { this.router.navigate(['/products']); }
        );
    }

    // ── Slug ─────────────────────────────────────────────────────────────────
    autoSlug() {
        if (!this.model.slug && this.model.name) {
            this.model.slug = this.model.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
    }

    regenerateSlug() {
        this.model.slug = this.model.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // ── Images ────────────────────────────────────────────────────────────────
    async addImage() {
        const result = await this.sharedservice.UploadFile('products', null, 'image');
        if (result?.url) this.model.images.push(result.url);
    }

    addImageUrl() {
        const url = (this.newImageUrl || '').trim();
        if (!url) {
            this.sharedservice.showAlert(2, 'Enter a valid image URL');
            return;
        }
        if (!/^https?:\/\//i.test(url)) {
            this.sharedservice.showAlert(2, 'URL must start with http:// or https://');
            return;
        }
        if (this.model.images.includes(url)) {
            this.sharedservice.showAlert(2, 'This image URL is already added');
            return;
        }
        this.model.images.push(url);
        this.newImageUrl = '';
    }

    removeImage(i: number) { this.model.images.splice(i, 1); }

    setMainImage(i: number) {
        if (i === 0) return;
        const img = this.model.images.splice(i, 1)[0];
        this.model.images.unshift(img);
    }

    moveImage(i: number, dir: -1 | 1) {
        const j = i + dir;
        if (j < 0 || j >= this.model.images.length) return;
        [this.model.images[i], this.model.images[j]] = [this.model.images[j], this.model.images[i]];
    }

    // ── Variants ──────────────────────────────────────────────────────────────
    addVariant() {
        const name = this.newVariantName.trim();
        if (!name) return;
        if (this.model.variants.find(v => v.name.toLowerCase() === name.toLowerCase())) {
            this.sharedservice.showAlert(2, 'Variant already exists');
            return;
        }
        this.model.variants.push({ name, options: [] });
        this.newVariantName = '';
    }

    removeVariant(i: number) { this.model.variants.splice(i, 1); }

    addOption(vi: number) {
        const label = (this.newOptionLabel[vi] || '').trim();
        if (!label) return;
        const stock = this.newOptionStock[vi] || 0;
        this.model.variants[vi].options.push({ label, value: label.toLowerCase().replace(/\s+/g, '-'), stock });
        this.newOptionLabel[vi] = '';
        this.newOptionStock[vi] = 0;
    }

    removeOption(vi: number, oi: number) { this.model.variants[vi].options.splice(oi, 1); }

    // ── Tags ──────────────────────────────────────────────────────────────────
    addTag() {
        const t = this.newTag.trim().toLowerCase();
        if (t && !this.model.tags.includes(t)) this.model.tags.push(t);
        this.newTag = '';
    }

    removeTag(i: number) { this.model.tags.splice(i, 1); }

    onTagKey(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); this.addTag(); }
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    validate() {
        let err = '';
        if (!this.model.name?.trim())                    err += 'Product name is required.<br/>';
        if (!this.model.price || this.model.price <= 0)  err += 'Price must be greater than 0.<br/>';
        if (this.model.salePrice && this.model.salePrice >= this.model.price) err += 'Sale price must be less than original price.<br/>';
        if (err) { this.sharedservice.showAlert(2, err); return; }

        this.model.name = this.model.name.trim();
        if (!this.model.slug) this.regenerateSlug();
        this.isSubmitting = true;
        this.isEdit ? this.update() : this.create();
    }

    create() {
        this.productsService.create(this.model).subscribe(
            () => {
                this.isSubmitting = false;
                this.sharedservice.showAlert(1, 'Product created successfully!');
                this.router.navigate(['/products']);
            },
            err => {
                this.isSubmitting = false;
                this.sharedservice.showAlert(2, err?.error?.error || 'Something went wrong');
            }
        );
    }

    update() {
        this.productsService.update(this.productId!, this.model).subscribe(
            () => {
                this.isSubmitting = false;
                this.sharedservice.showAlert(1, 'Product updated successfully!');
                this.router.navigate(['/products']);
            },
            err => {
                this.isSubmitting = false;
                this.sharedservice.showAlert(2, err?.error?.error || 'Something went wrong');
            }
        );
    }

    cancel() { this.router.navigate(['/products']); }

    scrollTo(sectionId: string) {
        this.activeSection = sectionId;
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    get totalStock(): number {
        return this.model.variants.reduce((sum, v) => sum + v.options.reduce((s, o) => s + (o.stock || 0), 0), 0);
    }

    get hasVariants(): boolean { return this.model.variants.length > 0; }
}
