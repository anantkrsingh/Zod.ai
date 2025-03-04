import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus } from "lucide-react";

const Header = () => {
  return (
    <div className="flex justify-between bg-white shadow-sm p-5 border-b">
      <Link href={"/dashboard"}>
        <span className="text-blue-700 text-2xl">zod.ai</span>
      </Link>
      <SignedIn>
        <div className="flex items-center space-x-2">
          <Button asChild variant="link" className="hidden md:flex ">
            <Link href={"/dashboard/upgrade"}>Pricing</Link>
          </Button>
          <Button asChild variant="outline" >
            <Link href={"/dashboard"}>My Documents </Link>
          </Button>

          <Button asChild variant="outline" className="border-blue-600">
            <Link href={"/dashboard/upload"}>
                <FilePlus className="text-blue-600"/>
             </Link>
          </Button>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
};

export default Header;
