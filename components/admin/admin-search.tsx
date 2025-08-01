"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const AdminSearch = () => {
  const pathName = usePathname();
  const formActionUrl = pathName.includes("/admin/orders")
    ? "/admin/orders"
    : pathName.includes("/admin/users")
    ? "/admin/users"
    : "/admin/products";

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        onChange={(event) => {
          setQueryValue(event.target.value);
        }}
        className="md:w-[100px] lg:w-[300px]"
      />
      <Button className="sr-only" type="submit">
        Search
      </Button>
    </form>
  );
};

export default AdminSearch;
