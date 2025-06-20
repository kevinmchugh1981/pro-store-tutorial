"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { CartItem } from "@/types";
import { prisma } from "@/db/prisma";

//Create order and create order items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;

    if (!userId) throw new Error("User ID not found");

    const user = await getUserById(userId);
    if (!user) throw new Error("User not found");

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "You cart is empty",
        redirectTo: "/cart",
      };
    }

    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    //Create order object
    const order = insertOrderSchema.parse({
      userId: userId,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
      paymentMethod: user.paymentMethod,
      shippingAddress: user.address,
    });

    //Create a transaction to insert order and order items
    const insertedOrderId = await prisma.$transaction(async (tx)=>{
        //Create order
       const insertedOrder = await tx.order.create({
            data:order,
        });

        //Create order items from cart items
        for(const item of cart.items as CartItem[]){
            await tx.orderItem.create({
                data:{
                    ...item,
                    price:item.price,
                    orderId: insertedOrder.id
                }
            });
        }

        //Clear cart 
        await tx.cart.update({
            where: {id:cart.id},
            data:{
                items: [],
                itemsPrice: 0,
                shippingPrice: 0,
                taxPrice: 0,
                totalPrice: 0,
            }
        });

        return insertedOrder.id;
    });

    if(!insertedOrderId) throw new Error("Order not created");

    return {success: true, message: "Order created", redirectTo: `/order/${insertedOrderId}`};
    
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

//Get order by id
export async function getOrderById(orderId: string){
  const data = await prisma.order.findFirst({
    where: {id: orderId}, include:{orderItems:true, user:{select: {name: true, email: true}}}
  });

  return convertToPlainObject(data);
}
