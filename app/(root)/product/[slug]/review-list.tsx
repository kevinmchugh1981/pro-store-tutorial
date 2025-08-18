'use client';
import { Review } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./review-form";


const ReviewList = ({userId, productId, productSlug}:{userId: string, productId: string, productSlug: string}) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    
    const reload = ()=>{console.log("Review submitted")};

    return ( 
        <div className="space-y-4">
            {reviews.length === 0 && <div>No reviews yet</div>}
            {
                userId ? (<ReviewForm userId={userId} productId={productId} onReviewSubmitted={reload}  />) : (<div>Please<Link className="text-blue-700 px-2" href={`/sign-in?callbackUrl=/product/${productSlug}`}>sign in</Link> to write a review</div>)
            }
            <div>
                {/*Reviews here*/}
            </div>
        </div>
     );
}
 
export default ReviewList;