"use client";

import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { PlusIcon, MinusIcon, Loader } from "lucide-react";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      //Handle success add to cart.
      toast({
        description: res.message,
        action: (
          <ToastAction
            className="bg-primary text-white hove:bg-gray-800"
            altText="Go To Cart"
            onClick={() => router.push("/cart")}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res.success ? "default" : "destructive",
        description: res.message,
      });

      return;
    });
  };

  //Check if item is in cart
  const existsItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existsItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (<MinusIcon className="w-4 h-4" />)}
      </Button>
      <span className="px-2">{existsItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        {isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (<PlusIcon className="w-4 h-4" />)}
      </Button>
    </div>
  ) : (
    <Button className="w-full" type="button" onClick={handleAddToCart}>
      {isPending ? (<Loader className="w-4 h-4 animate-spin" />) : (<PlusIcon className="w-4 h-4" />)}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
