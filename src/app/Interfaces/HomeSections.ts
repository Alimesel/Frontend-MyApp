export interface HomeSection {
    id: number;
    title: string;
    description: string;
    imageUrl: string;  // Changed from imageUrl1 to match API
    imageUrl2: string;
    imageUrl3: string;
    imageUrl4: string;
    displayOrder: number;  // Changed from string to number
    isActive: boolean;
}