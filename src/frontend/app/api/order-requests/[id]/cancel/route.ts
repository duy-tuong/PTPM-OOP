import { NextResponse } from "next/server";
import { cancelOrderRequest } from "@/lib/api/sales";
import { ApiError } from "@/lib/api/http";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";


// Đợt 13, Phần 1 (A2) - khách tự huỷ đơn CHƯA thanh toán của chính mình, mirror
// app/api/order-requests/items/[itemId]/change-plan/route.ts. Không nhận body - id đơn nằm trong URL.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const token = await getCustomerAccessToken();
    if (!token) {
        return NextResponse.json({ message: "Vui lòng đăng nhập để huỷ đơn hàng." }, { status: 401 });
    }


    const { id } = await params;


    try {
        const result = await cancelOrderRequest(Number(id), token);
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        throw error;
    }
}
