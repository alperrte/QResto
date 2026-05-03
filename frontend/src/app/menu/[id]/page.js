import MenuDetailPage from "@/features/menu/menu-product-detail/components/MenuDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <MenuDetailPage productId={id} />;
}
