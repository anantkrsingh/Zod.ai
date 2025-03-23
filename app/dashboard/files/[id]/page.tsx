import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

async function ChatToFilePage({ params: { id } }: { params: { id: string } }) {
  auth.protect();

  const { userId } = await auth();

  const ref = await adminDb
    .collection("userrs")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .get();
  const url = ref.data()?.downloadUrl;

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      {/* Chat Section */}
      <div className="order-1 lg:order-2 w-full lg:w-1/2 h-1/2 lg:h-full overflow-y-auto">
        <Chat id={id} />
      </div>
      {/* PDF View Section */}
      <div className="order-2 lg:order-1 w-full lg:w-1/2 h-1/2 lg:h-full bg-gray-100 border-t lg:border-t-0 lg:border-r border-blue-600 overflow-auto">
        <div className="w-full h-full">
          <PdfView url={url} />
        </div>
      </div>
    </div>
  );
}

export default ChatToFilePage;
