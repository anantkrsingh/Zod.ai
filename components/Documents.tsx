import { adminDb } from "@/firebaseAdmin";
import PlaceholderDocument from "./PlaceholderDocument";
import {auth} from "@clerk/nextjs/server";
import Document from "./Document";

async function Documents() {
  auth.protect()

  const { userId } = await auth();

  if(!userId){
    throw new Error("User not found");
  }
  const documentSnapshot = await adminDb.
  collection("userrs")
  .doc(userId)
  .collection("files")
  .get();
  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center
     lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      {
        documentSnapshot.docs.map((doc) => {
          const {name,downloadUrl,size} = doc.data();
          return (
            <Document
            key={doc.id}
            name={name}
            downloadUrl={downloadUrl}
            size={size}
            id={doc.id}
            />
          );
        })
      }
        <PlaceholderDocument/>
     </div>
  );
}

export default Documents;
