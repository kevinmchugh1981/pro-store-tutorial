"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

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
        message: `${product.name} added to cart`,
      };
    } else {
      //Check if item is already in the cart
      const existingItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existingItem) {
        //Check stock
        if (product.stock < existingItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        //Increase the quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existingItem.qty + 1;
      } else {
        //If item does not exists in cart.
        //Check the stock
        if (product.stock < 1) {
          throw new Error("Not enough stock");
        }

        //Add item to the cart.items
        cart.items.push(item);
      }

      //Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existingItem ? "updated in" : "added to"
        } cart`,
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
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
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

export async function removeItemFromCart(productId: string) {
  try {

    //Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found.");

    //Get cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    //Check for item.
    const exists = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exists) throw new Error("Item not found.");

    //Check if only one in qty
    if (exists.qty === 1) {
      //Remove from cart.
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exists.productId
      );
    } else {
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exists.qty - 1;
    }

    //Update cart in database.
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return{
      success: true, message:`${product.name} was removed from cart`
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
