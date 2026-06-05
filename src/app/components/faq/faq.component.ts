import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../shared/services/shared.service';
import { urlConstant } from '../../shared/constant/urlConst';

@Component({
    selector: 'app-faq',
    standalone: false,
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.scss']
})
export class FaqAdminComponent implements OnInit {

    categories: any[] = [];
    isLoading = false;

    // Selected category for editing articles
    selectedCat: any = null;

    // Category form
    showCatForm = false;
    editingCatId: number | null = null;
    catForm = { name: '', icon: '', sortOrder: 0, isActive: true };
    catSaving = false;

    // Article form
    showArtForm = false;
    editingArtId: number | null = null;
    artForm = { title: '', content: '', sortOrder: 0, isActive: true };
    artSaving = false;

    constructor(
        public sharedService: SharedService,
        private http: HttpClient
    ) {}

    ngOnInit(): void { this.loadAll(); }

    loadAll(): void {
        this.isLoading = true;
        this.http.get<any>(urlConstant.FaqAPI.getAdminCategories).subscribe(
            res => {
                this.categories = res.data || [];
                // Refresh selected cat
                if (this.selectedCat) {
                    this.selectedCat = this.categories.find(c => c.id === this.selectedCat.id) || null;
                }
                this.isLoading = false;
            },
            () => { this.isLoading = false; }
        );
    }

    selectCat(cat: any): void {
        this.selectedCat = cat;
        this.showArtForm = false;
        this.editingArtId = null;
    }

    // ── Category CRUD ─────────────────────────────────────────────────────────
    openAddCat(): void {
        this.catForm = { name: '', icon: 'fa-light fa-circle-question', sortOrder: this.categories.length + 1, isActive: true };
        this.editingCatId = null;
        this.showCatForm = true;
    }

    openEditCat(cat: any, e: Event): void {
        e.stopPropagation();
        this.catForm = { name: cat.name, icon: cat.icon || '', sortOrder: cat.sortOrder, isActive: !!cat.isActive };
        this.editingCatId = cat.id;
        this.showCatForm = true;
    }

    saveCat(): void {
        if (!this.catForm.name.trim()) return;
        this.catSaving = true;
        const req = this.editingCatId
            ? this.http.put(`${urlConstant.FaqAPI.updateCategory}${this.editingCatId}`, this.catForm)
            : this.http.post(urlConstant.FaqAPI.createCategory, this.catForm);
        req.subscribe(
            () => { this.catSaving = false; this.showCatForm = false; this.loadAll(); this.sharedService.showAlert(1, 'Category saved'); },
            () => { this.catSaving = false; this.sharedService.showAlert(2, 'Failed to save'); }
        );
    }

    deleteCat(cat: any, e: Event): void {
        e.stopPropagation();
        if (!confirm(`Delete category "${cat.name}" and all its articles?`)) return;
        this.http.delete(`${urlConstant.FaqAPI.deleteCategory}${cat.id}`).subscribe(
            () => { if (this.selectedCat?.id === cat.id) this.selectedCat = null; this.loadAll(); this.sharedService.showAlert(1, 'Deleted'); },
            () => this.sharedService.showAlert(2, 'Failed to delete')
        );
    }

    // ── Article CRUD ──────────────────────────────────────────────────────────
    openAddArt(): void {
        const arts = this.selectedCat?.articles || [];
        this.artForm = { title: '', content: '', sortOrder: arts.length + 1, isActive: true };
        this.editingArtId = null;
        this.showArtForm = true;
    }

    openEditArt(art: any): void {
        this.artForm = { title: art.title, content: art.content || '', sortOrder: art.sortOrder, isActive: !!art.isActive };
        this.editingArtId = art.id;
        this.showArtForm = true;
    }

    saveArt(): void {
        if (!this.artForm.title.trim()) return;
        this.artSaving = true;
        const payload = { ...this.artForm, categoryId: this.selectedCat.id };
        const req = this.editingArtId
            ? this.http.put(`${urlConstant.FaqAPI.updateArticle}${this.editingArtId}`, payload)
            : this.http.post(urlConstant.FaqAPI.createArticle, payload);
        req.subscribe(
            () => { this.artSaving = false; this.showArtForm = false; this.loadAll(); this.sharedService.showAlert(1, 'Article saved'); },
            () => { this.artSaving = false; this.sharedService.showAlert(2, 'Failed to save'); }
        );
    }

    deleteArt(art: any): void {
        if (!confirm(`Delete article "${art.title}"?`)) return;
        this.http.delete(`${urlConstant.FaqAPI.deleteArticle}${art.id}`).subscribe(
            () => { this.loadAll(); this.sharedService.showAlert(1, 'Deleted'); },
            () => this.sharedService.showAlert(2, 'Failed to delete')
        );
    }

    cancelCatForm(): void { this.showCatForm = false; }
    cancelArtForm(): void { this.showArtForm = false; }
}
