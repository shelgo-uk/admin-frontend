import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared/services/shared.service';
import { urlConstant } from '../../shared/constant/urlConst';

@Component({
    selector: 'app-category-page-builder',
    standalone: false,
    templateUrl: './category-page-builder.component.html',
    styleUrls: ['./category-page-builder.component.scss']
})
export class CategoryPageBuilderComponent implements OnInit {

    // All root categories
    rootCategories: any[] = [];
    selectedCategoryId: number | null = null;
    selectedCategory: any = null;

    // Config being edited
    config: any = {
        heroBanner: { url: '', title: '', subtitle: '', btnText: '', btnLink: '', link: '', align: 'left' },
        featuredTitle: '',
        sections: []
    };

    isLoading = false;
    isSaving = false;

    sectionTypes = [
        { value: 'banner_grid', label: 'Banner Grid (1/2/3 columns)' },
        { value: 'text_banner', label: 'Text Banner (full width)' },
        { value: 'sub_category_links', label: 'Sub-Category Links' },
    ];

    constructor(
        public sharedService: SharedService,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.loadRootCategories();
    }

    loadRootCategories(): void {
        this.http.get<any>(urlConstant.CategoryAPI.getAll).subscribe(
            res => {
                const all = res.data || [];
                this.rootCategories = all.filter((c: any) => !c.parentId && c.isActive);
            }
        );
    }

    selectCategory(cat: any): void {
        this.selectedCategory = cat;
        this.selectedCategoryId = cat.id;
        this.loadConfig(cat.id);
    }

    loadConfig(categoryId: number): void {
        this.isLoading = true;
        this.http.get<any>(`${urlConstant.CategoryPageAPI.getAdmin}${categoryId}`).subscribe(
            res => {
                if (res.data?.config) {
                    this.config = this.mergeConfig(res.data.config);
                } else {
                    this.resetConfig();
                }
                this.isLoading = false;
            },
            () => { this.resetConfig(); this.isLoading = false; }
        );
    }

    mergeConfig(incoming: any): any {
        return {
            heroBanner: {
                url: '', title: '', subtitle: '', btnText: '', btnLink: '', link: '', align: 'left',
                ...(incoming.heroBanner || {})
            },
            featuredTitle: incoming.featuredTitle || '',
            sections: incoming.sections || []
        };
    }

    resetConfig(): void {
        this.config = {
            heroBanner: { url: '', title: '', subtitle: '', btnText: '', btnLink: '', link: '', align: 'left' },
            featuredTitle: '',
            sections: []
        };
    }

    // ── Hero Banner ──────────────────────────────────────────────────────────
    async uploadHeroImage(): Promise<void> {
        const result = await this.sharedService.UploadFile('category-pages', null, 'image');
        if (result?.url) this.config.heroBanner.url = result.url;
    }

    removeHeroImage(): void { this.config.heroBanner.url = ''; }

    // ── Sections ─────────────────────────────────────────────────────────────
    addSection(type: string): void {
        const section: any = { type, title: '', linkText: '', linkUrl: '' };
        if (type === 'banner_grid') {
            section.cols = 2;
            section.banners = [
                { url: '', label: '', btnText: '', link: '' },
                { url: '', label: '', btnText: '', link: '' }
            ];
        } else if (type === 'text_banner') {
            section.body = '';
            section.btnText = '';
            section.btnLink = '';
            section.bgColor = '#f5f5f5';
            section.textColor = '#1c1c1c';
        } else if (type === 'sub_category_links') {
            // No extra fields needed
        }
        this.config.sections.push(section);
    }

    removeSection(i: number): void {
        this.config.sections.splice(i, 1);
    }

    moveSectionUp(i: number): void {
        if (i === 0) return;
        const tmp = this.config.sections[i - 1];
        this.config.sections[i - 1] = this.config.sections[i];
        this.config.sections[i] = tmp;
    }

    moveSectionDown(i: number): void {
        if (i >= this.config.sections.length - 1) return;
        const tmp = this.config.sections[i + 1];
        this.config.sections[i + 1] = this.config.sections[i];
        this.config.sections[i] = tmp;
    }

    // ── Banner Grid helpers ───────────────────────────────────────────────────
    onColsChange(section: any): void {
        const cols = Number(section.cols);
        while (section.banners.length < cols) {
            section.banners.push({ url: '', label: '', btnText: '', link: '' });
        }
        section.banners = section.banners.slice(0, cols);
    }

    async uploadBannerImage(section: any, idx: number): Promise<void> {
        const result = await this.sharedService.UploadFile('category-pages', null, 'image');
        if (result?.url) section.banners[idx].url = result.url;
    }

    removeBannerImage(section: any, idx: number): void {
        section.banners[idx].url = '';
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    save(): void {
        if (!this.selectedCategoryId) return;
        this.isSaving = true;
        this.http.post<any>(
            `${urlConstant.CategoryPageAPI.save}${this.selectedCategoryId}`,
            { config: this.config }
        ).subscribe(
            () => {
                this.isSaving = false;
                this.sharedService.showAlert(1, 'Category page saved successfully');
            },
            () => {
                this.isSaving = false;
                this.sharedService.showAlert(2, 'Failed to save');
            }
        );
    }

    toSlug(name: string): string {
        return name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
    }
}
