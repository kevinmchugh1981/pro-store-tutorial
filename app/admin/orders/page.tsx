import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string; query: string }>;
}) => {
  await requireAdmin();

  const { page = "1", query:searchText } = await props.searchParams;  
  const orders = await getAllOrders({page: Number(page), query: searchText});

  return (<div className="space-y-2">
         <div className="flex items-center">
          <h1 className="h2-bold">Orders</h1>
          {searchText && (
            <div className="pl-10">{' '}Filtered by <i>&quot;{searchText}&quot;</i>{' '}
            <Link href="/admin/orders"><Button variant="outline" size="sm">Remove Filter</Button></Link>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>DATE</TableHead>
                        <TableHead>BUYER</TableHead>
                        <TableHead>TOTAL</TableHead>
                        <TableHead>PAID</TableHead>
                        <TableHead>DELIVERED</TableHead>
                        <TableHead>ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.data.map((order)=>(
                        <TableRow key={order.id}>
                            <TableCell>{formatId(order.id)}</TableCell>
                            <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                            <TableCell>{order.isPaid  && order.paidAt ? formatDateTime(order.paidAt).dateTime : 'Not Paid'}</TableCell>
                            <TableCell>{order.isDelivered  && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : 'Not Delivered'}</TableCell>
                            <TableCell><Button asChild variant="outline" size="sm"><Link href={`/order/${order.id}`}>Details</Link></Button><DeleteDialog id={order.id} action={deleteOrder}/></TableCell>
                        </TableRow>
                    ))} 
                </TableBody>
            </Table>
            {orders.totalPages > 1 && (<Pagination page={Number(page) || 1} totalPages={orders.totalPages}></Pagination>)}
        </div>
    </div>);
};

export default AdminOrdersPage;
