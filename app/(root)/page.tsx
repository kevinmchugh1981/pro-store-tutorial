import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/header/product/product-list";

const Homepage  =  () => {
  return ( <><ProductList data={sampleData.products} title="Newest Arrivals" limit={4}></ProductList></> );
}
 
export default Homepage;