import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";


import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"


import { VertexAI } from "@langchain/google-vertexai";


const project = 'etm-cloud';

import pineconeClient from "./pinecone";
import { auth } from "@clerk/nextjs/server";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { adminDb } from "@/firebaseAdmin";
import { AIMessage, HumanMessage } from "@langchain/core/messages";


// const vertexAI = new VertexAI({  location: location });

const model = new VertexAI({
    authOptions: {
        credentials: { "type": "service_account", "project_id": project },
    },
    model: "gemini-2.0-flash-lite-001",
    temperature: 0,

});


// const generativeModel = vertexAI.getGenerativeModel({
//     model: textModel,
//     safetySettings: [{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }],
//     generationConfig: { maxOutputTokens: 256 },
// });



// const model = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     modelName: "gemini-2.5-flash",
//     streaming: true,
//     streamUsage: true,
// });

// const model = new ChatOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     modelName: "gpt-4o-mini",
// })

export const indexName = "zodai-gemini";

async function fetchMessagesFromDb(docId: string) {
    const { userId } = await auth();
    // const LIMIT = 6;
    if (!userId) {
        throw new Error("User not found");
    }

    console.log(
        " ---------------- Fetching chat history from the firebase firestore -----------------"
    );

    const chats = await adminDb
        .collection("userrs")
        .doc(userId!)
        .collection("files")
        .doc(docId)
        .collection("chat")
        .orderBy("createdAt", "desc")
        .get();

    const chatHistory = chats.docs.map((doc) => {
        return doc.data().role === "human"
            ? new HumanMessage(doc.data().message)
            : new AIMessage(doc.data().message);
    });

    console.log(` ----------------- Chat history fetched successfully of length ${chatHistory.length}  -----------------`);
    return chatHistory;
}

async function namespaceExists(
    index: Index<RecordMetadata>,
    namespace: string
) {
    if (namespace === null) throw new Error("No namespace value provided");

    const { namespaces } = await index.describeIndexStats();

    return namespaces?.[namespace] !== undefined;
}

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    console.log("Fetching download url from firebase");

    const firebaseRef = await adminDb
        .collection("userrs")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .get();

    const firebaseData = firebaseRef.data();

    if (!firebaseData || !firebaseData.downloadUrl) {
        throw new Error("Download URL not found");
    }

    const downloadUrl = firebaseData.downloadUrl;

    if (!downloadUrl) {
        throw new Error("Download url not found");
    }

    console.log(`Download url fetched successfully ${downloadUrl}`);

    const response = await fetch(downloadUrl);

    const data = await response.blob();

    const loader = new PDFLoader(data);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);

    console.log(`Split into ${splitDocs.length} parts`);

    return splitDocs;
}

export async function generateEmbeedingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    let pineconeVectorStore;

    console.log("Generating embeedings for the split documents");
    const embeedings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
    });

    // const embeedings = new OpenAIEmbeddings({
    //     apiKey: process.env.OPENAI_API_KEY,
    // })

    const index = await pineconeClient.index(indexName);

    const namespaceAlreadyExist = await namespaceExists(index, docId);

    if (namespaceAlreadyExist) {
        console.log(
            `Namespace for ${docId} already exists, reusing existing embeedings`
        );

        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeedings, {
            pineconeIndex: index,
            namespace: docId,
        });

        return pineconeVectorStore;
    } else {
        const splitDocs = await generateDocs(docId);

        console.log(
            `Storing the embeedings in namespace ${docId} in the ${indexName} Pinecone vector store`
        );

        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs,
            embeedings,
            {
                pineconeIndex: index,
                namespace: docId,
            }
        );

        return pineconeVectorStore;
    }
}

async function generateLangchainCompletion(
    docId: string,
    question: string
) {

    let initialMillis = Date.now()
    let pineconeVectorStore;

    pineconeVectorStore = await generateEmbeedingsInPineconeVectorStore(docId);

    if (!pineconeVectorStore) {
        throw new Error("Pinecone vector store not found");
    }
    console.log("--------------- Creating a retriever... -----------------");
    const retriever = pineconeVectorStore.asRetriever();

    const chatHistory = await fetchMessagesFromDb(docId);

    console.log("--------------- Defining a prompt template ... -----------------");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory,
        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Don't include answers of previously asked quesiton just follow up them and reform the answer.",
        ]
    ]);

    console.log("--------------- Creating a histor-aware chat retriever chain... -----------------");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    })

    console.log("--------------- Defining a prompt template for answering questions... -----------------");

    const historyAwareRetrievalPrommpt = ChatPromptTemplate.fromMessages([

        [
            "system",
            `You are an AI agent named Zod.ai which performs document summarization based on the given data and context developed by Kavach Innovations India.
           
    Answer the user's questions based on the below context: 
    
    {context}`
        ],
        ...chatHistory,
        ["user", "{input}"],
    ])

    console.log("--------------- Creating document combining chain... -----------------");

    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm: model,
        prompt: historyAwareRetrievalPrommpt
    });

    console.log("--------------- Creating the main retrieval chain... -----------------"
    )

    const conversationRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCombineDocsChain,


    });

    console.log("--------------- Running the chain with simple conversation... -----------------");
    const reply = await conversationRetrievalChain.invoke({
        input: question,
    })
    let finalMillis = Date.now()
    console.log(reply.answer)

    console.log((finalMillis - initialMillis) / 1000)


    return reply.answer;


}


export { model, generateLangchainCompletion }