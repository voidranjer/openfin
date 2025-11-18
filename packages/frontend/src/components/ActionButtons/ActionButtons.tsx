// import { useState } from "react";
// import { CiSettings } from "react-icons/ci";
// import { FaExternalLinkAlt } from "react-icons/fa";
import { ButtonGroup } from "@/components/ui/button-group";
// import { Button } from "@/components/ui/button";

import DownloadCsvButton from "@/components/ActionButtons/DownloadCsvButton";
import SyncAccountsButton from "./SyncAccountsButton";
// import CategorizeButton from "@/components/ActionButtons/Categorization/CategorizeButton";
// import CategoryConfigDialog from "@/components/ActionButtons/Categorization/CategoryConfigDialog";

export default function ActionButtons() {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* <CategoryConfigDialog isOpen={isOpen} setIsOpen={setIsOpen} /> */}
      <ButtonGroup>
        {/* <ButtonGroup> */}
        {/*   <CategorizeButton /> */}
        {/*   <Button */}
        {/*     size="sm" */}
        {/*     className="bg-red-200 hover:bg-red-300 group" */}
        {/*     onClick={() => setIsOpen(true)} */}
        {/*   > */}
        {/*     <CiSettings className="text-black transition-transform duration-300 ease-in-out group-hover:rotate-90 group-hover:scale-150" /> */}
        {/*   </Button> */}
        {/* </ButtonGroup> */}
        <ButtonGroup>
          <SyncAccountsButton />
          {/* <Button */}
          {/*   size="sm" */}
          {/*   className="group" */}
          {/*   asChild> */}
          {/*   <a */}
          {/*     href="https://actual.amperleft.com/" */}
          {/*     target="_blank" */}
          {/*     rel="noopener noreferrer" */}
          {/*     className="bg-red-200 hover:bg-red-300" */}
          {/*   > */}
          {/*     <FaExternalLinkAlt className="text-black transition-transform duration-300 ease-in-out group-hover:rotate-90 group-hover:scale-150" /> */}
          {/*   </a> */}
          {/* </Button> */}
        </ButtonGroup>
        <ButtonGroup>
          <DownloadCsvButton />
        </ButtonGroup>
      </ButtonGroup>
    </>
  );
}
