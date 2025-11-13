import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { IoMdSync } from "react-icons/io";
import { CiBank } from "react-icons/ci";
import { HiChevronDown } from "react-icons/hi2";

import useChromeStorage from "@/hooks/useChromeStorage";

export default function SyncAccountsButton() {
  const [actualBudgetAccounts] = useChromeStorage("actualBudgetAccounts", []);
  const [currActualBudgetAccount, setCurrActualBudgetAccount] = useChromeStorage("currActualBudgetAccount", null);

  function handleSyncAccounts() {
    window.open("https://demo.openbanker.org/accounts?openBankerSync=true", "_blank");
  }

  function handleExportToAccount() {
    if (currActualBudgetAccount === null) return;
    window.open(`https://demo.openbanker.org/accounts/${currActualBudgetAccount.id}?openBankerSync=true`, "_blank");
  }

  const isCurrAccountNull = currActualBudgetAccount === null;

  return (
    <>
      {
        actualBudgetAccounts.length > 0 ? <>
          <Button size="sm" variant="outline" disabled={isCurrAccountNull} onClick={handleExportToAccount}>
            {isCurrAccountNull ? "Select Account" : `Export to ${currActualBudgetAccount?.name}`}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="">
                <HiChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="[--radius:1rem]">
              <DropdownMenuGroup>
                {actualBudgetAccounts.map(a => (
                  <DropdownMenuItem className="hover:cursor-pointer" onClick={() => setCurrActualBudgetAccount(a)} key={a.id}>
                    <CiBank />
                    {a.name}
                  </DropdownMenuItem>
                )
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleSyncAccounts}
                  variant="destructive"
                  className="group hover:cursor-pointer"
                >
                  <IoMdSync className="transition-transform duration-300 ease-in-out group-hover:scale-150 group-hover:rotate-90" />
                  Sync Accounts from ActualBudget
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </> :
          <Button
            className="text-black bg-blue-200 hover:bg-blue-300 group"
            size="sm"
            onClick={handleSyncAccounts}
          >
            <IoMdSync className="transition-transform duration-300 ease-in-out group-hover:scale-150 group-hover:rotate-90" />
            Sync Accounts from ActualBudget
          </Button>

      }

    </>
  );
}
