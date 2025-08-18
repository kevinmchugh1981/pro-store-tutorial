"use server";

import z from "zod";
import { insertReviewSchema } from "../validators";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

//Create and update reviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error("Use is not authenticated");

    //Validate and store the review
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    //Get product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error("Product not found");

    //Check if user already reviewed
    const reviewExists = await prisma.review.findFirst({
      where: { productId: review.productId, userId: review.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        //Update review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        //Create review
        await tx.review.create({ data: review });
      }
      //Get average rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      //get number of reviews
      const numberOfReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      //Update the rating and number of reviews in product table.
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews: numberOfReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);
    return { success: true, message: "Review update successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews for a product
export async function getReviewsByProductId({productId}: {productId: string})
{
  const data = await prisma.review.findMany({where: {productId: productId}, include:{user: {select:{name:true}}}, orderBy:{createdAt: "desc"}});
  return {data};
}

//Get a review written by the current user
export async function getUserReviewByProductId({productId}:{productId: string}){
  const session = await auth();
  if(!session) throw new Error("User it no authenticated");

  return await prisma.review.findFirst({where: {productId: productId, userId: session.user.id}});
}