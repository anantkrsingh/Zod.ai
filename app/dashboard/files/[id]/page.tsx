import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
async function ChatToFilePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  auth.protect();

  const { userId } = await auth();

  const ref = await adminDb
    .collection("userrs")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .get();
  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* Right */}
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">{/* Chat */}</div>
      {/* PDF View */}
      <div className="col-span-5 lg:col-span-3"></div>
    </div>
  );
}

export default ChatToFilePage;
