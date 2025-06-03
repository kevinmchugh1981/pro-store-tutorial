'use client'

import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { PlusIcon } from "lucide-react";

const AddToCart = ({item } :{item: CartItem}) => {

    const router = useRouter();
    const {toast} = useToast();

    const handleAddToCart = async() =>{
        const res = await addItemToCart(item);

        if(!res.success){
            toast({
                variant:'destructive',
                description:res.message
            });
            return;
        }

        //Handle success add to cart.
        toast({
            description: `${item.name} added to cart`,
            action:(
                <ToastAction className="bg-primary text-white hove:bg-gray-800" altText="Go To Cart" onClick={()=> router.push('/cart')}>
                    Go To Cart
                </ToastAction>
            )
        });
    }

    return ( <Button className="w-full" type="button" onClick={handleAddToCart}><PlusIcon/>Add To Cart</Button> );
}

export default AddToCart;