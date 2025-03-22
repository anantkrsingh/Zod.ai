import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import pineconeClient from "./pinecone"
import { auth } from "@clerk/nextjs/server"
import { Index, RecordMetadata } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

import { adminDb } from "@/firebaseAdmin"

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-pro",
  });
export const indexName = "zodai-gemini"


async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {

    if (namespace === null) throw new Error("No namespace value provided");


    const { namespaces } = await index.describeIndexStats();

    return namespaces?.[namespace] !== undefined;

}

export async function generateDocs(docId: string) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("User not found")
    }

    console.log("Fetching download url from firebase")

    const firebaseRef = await adminDb
        .collection("userrs").doc(userId).collection("files").doc(docId).get()

    const firebaseData = firebaseRef.data();

    if (!firebaseData || !firebaseData.downloadUrl) {
        throw new Error("Download URL not found");
    }

    const downloadUrl = firebaseData.downloadUrl;

    if (!downloadUrl) {
        throw new Error("Download url not found")
    }

    console.log(`Download url fetched successfully ${downloadUrl}`)

    const response = await fetch(downloadUrl)

    const data = await response.blob()

    const loader = new PDFLoader(data)
    const docs = await loader.load()


    const splitter = new RecursiveCharacterTextSplitter()
    const splitDocs = await splitter.splitDocuments(docs)
    console.log(`Split into ${splitDocs.length} parts`)

    return splitDocs;
}


export async function generateEmbeedingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("User not found")
    }

    let pineconeVectorStore;

    console.log("Generating embeedings for the split documents")
    const embeedings = new GoogleGenerativeAIEmbeddings({
        apiKey:process.env.GEMINI_API_KEY
    })

    const index = await pineconeClient.index(indexName)

    const namespaceAlreadyExist = await namespaceExists(index, docId);

    if (namespaceAlreadyExist) {
        console.log(`Namespace for ${docId} already exists, reusing existing embeedings`)

        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeedings, {
            pineconeIndex: index, namespace: docId
        })

        return pineconeVectorStore;
    }
    else {
        const splitDocs = await generateDocs(docId);

        console.log(`Storing the embeedings in namespace ${docId} in the ${indexName} Pinecone vector store`)

        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs,
            embeedings,
            {
                pineconeIndex: index,
                namespace: docId
            }
        )

        return pineconeVectorStore;
    }
}