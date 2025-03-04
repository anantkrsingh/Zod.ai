import Image from "next/image";
import {
  BrainIcon,
  Eye,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    name: "Store your PDF Documents",
    description:
      "Keep your all important PDF files securely sored and easily accessible anytime, anywhere",
    icon: BrainIcon,
  },
  {
    name: "Store your PDF Documents",
    description:
      "Keep your all important PDF files securely sored and easily accessible anytime, anywhere",
    icon: Eye,
  },
  {
    name: "Store your PDF Documents",
    description:
      "Keep your all important PDF files securely sored and easily accessible anytime, anywhere",
    icon: GlobeIcon,
  },
  {
    name: "Store your PDF Documents",
    description:
      "Keep your all important PDF files securely sored and easily accessible anytime, anywhere",
    icon: MonitorSmartphoneIcon,
  },
  {
    name: "Store your PDF Documents",
    description:
      "Keep your all important PDF files securely sored and easily accessible anytime, anywhere",
    icon: ServerCogIcon,
  },
  {
    name: "Store your PDF Documents",
    description:
      "Keep your all important PDF files securely sored and easily accessible anytime, anywhere",
    icon: ZapIcon,
  },
];
export default function Home() {
  return (
    <main className="flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-gray-300">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7  text-gray-500">
              AI Powered document intelligence plattform
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Chat with your PDFs effortlessly
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Introducing{" "}
              <span className="font-bold text-blue-600"> zod.ai</span>
              <br />
              <br /> Ask questions, get summaries, and extract key insights
              instantly and free! <span className="text-blue-600">
                zod.ai
              </span>{" "}
              simplifies{" "}
              <span className="font-bold">
                document question answering and document management
              </span>
            </p>
          </div>
          <Button asChild className="mt-10 bg-black text-white" variant={"secondary"}>
            <Link href={"/dashboard"}>Get started</Link>
          </Button>
        </div>
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              alt="screenshot"
              src={"https://imgur.com/VciRSTI.jpeg"}
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
            <div aria-hidden className="relative">
              <div className="absolute -inset-x-32 bottom-0 bg-gradient-to-t from-white/95 pt-[5%] "></div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 mx-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl
            className="mx-auto grid max-w-2xl grid-cols-1 
          gap-x-6 gap-y-10 text-base leading-7 text-gray-600
           sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16
           
           "
          >
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                  />
                </dt>
                <dd>{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
