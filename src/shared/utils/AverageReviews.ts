import { Review } from "@/actions/reviews";

export function averageReviews(reviews: Review[] | null | undefined) {
    if (reviews === null || reviews === undefined || reviews.length === 0 ) return "0.0";
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    const average = sum / reviews.length;
    
    // Округляем до одного знака после запятой
    return average.toFixed(1);
}
