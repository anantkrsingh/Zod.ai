'use server'

import { generateEmbeedingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

export async function generateEmbeedings(docId:string){
    auth.protect()


    await generateEmbeedingsInPineconeVectorStore(docId);


    revalidatePath("/dashboard")

    return {completed:true}
}