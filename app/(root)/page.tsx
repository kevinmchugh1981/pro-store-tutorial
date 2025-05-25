import ProductList from "@/components/shared/header/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";

const Homepage = async () => {

  const latestProducts = await getLatestProducts();
  return ( <><ProductList data={latestProducts} title="Newest Arrivals" limit={LATEST_PRODUCTS_LIMIT}></ProductList></> );
}
 
export default Homepage;