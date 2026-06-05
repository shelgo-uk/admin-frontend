export class ProductReqModel {
    name: string = '';
    slug: string = '';
    description: string = '';
    price: number = 0;
    salePrice: number | null = null;
    categoryId: number | null = null;
    brandId: number | null = null;
    images: string[] = [];
    variants: ProductVariant[] = [];
    tags: string[] = [];
    isActive: boolean = true;
    sortOrder: number = 0;
}

export class ProductVariant {
    name: string = '';       // e.g. "Colour", "Size"
    options: VariantOption[] = [];
}

export class VariantOption {
    label: string = '';      // e.g. "Red", "XL"
    value: string = '';
    stock: number = 0;
}
