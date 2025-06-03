"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    //Get session details
    const sessionDetails = await getSessionDetails();

    console.log(sessionDetails);
    //Get cart
    const cart = await getMyCart();
console.log(cart);

    //Parse and validate item
    const item = cartItemSchema.parse(data);

    console.log(item);
    //Find product in database
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    console.log(product);
    if (!product) throw new Error("Product not found");

    if (!cart) {
      //Create new cart object
      const newCart = insertCartSchema.parse({
        userId: sessionDetails.userId,
        items: [item],
        sessionCartId: sessionDetails.sessionCartId,
        ...calcPrice([item]),
      });

      console.log(newCart);
      //Add to databse
      await prisma.cart.create({
        data: newCart,
      });

      //Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: "Item added to cart",
      };
    } else {
      return {
        success: true,
        message: "Item added to cart",
      };
    }
  } catch (error) {
    console.log(error);
    return {  
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  //Get session details
  const sessionDetails = await getSessionDetails();

  //Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: sessionDetails.userId
      ? { userId: sessionDetails.userId }
      : { sessionCartId: sessionDetails.sessionCartId },
  });

  if (!cart) return undefined;
  //Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.itemsPrice.toString(),
    shippingPrice: cart.itemsPrice.toString(),
    taxPrice: cart.itemsPrice.toString(),
  });
}

export async function getSessionDetails() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found");

  //Get session and user id
  const session = await auth();
  const userId = session?.user.id ? (session.user.id as string) : undefined;

  return {
    sessionCartId: sessionCartId,
    userId: userId,
  };
}
