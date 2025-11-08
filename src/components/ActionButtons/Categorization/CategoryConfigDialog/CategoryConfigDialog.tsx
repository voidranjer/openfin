import React from "react";
import { GrRevert } from "react-icons/gr";
import { MdModeEditOutline } from "react-icons/md";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import useChromeStorage from "@/hooks/useChromeStorage";

export const defaultCategories =
  "Allowance, Credit Card Payments, Dining, Education, Entertainment, Transportation, Groceries, Health, Home, Insurance, Misc, Paycheque, Savings and Investments, Taxes and government, Transfers, Utilities, Subscriptions";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
};

export default function CategoryConfigDialog({
  isOpen,
  setIsOpen,
  children,
}: Props) {
  const [categories, setCategories] = useChromeStorage<string>(
    "categories",
    defaultCategories
  );
  const [rules, setRules] = useChromeStorage<string>("rules", "");
  const [apiKey, setApiKey] = useChromeStorage<string>("apiKey", "");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex mb-5">
            <MdModeEditOutline className="me-1" />
            Auto-Category Configuration
          </DialogTitle>
	  <DialogDescription>
	    Configure LLM parameters for auto-categorization
	  </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-5">
          <InputGroup>
            <InputGroupTextarea
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="Bill Payments, Dining, Education, Entertainment, ..."
            />
            <InputGroupAddon>
              <Label>Categories</Label>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                title="Revert to default"
                onClick={() => setCategories(defaultCategories)}
              >
                <GrRevert />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupTextarea
              value={rules}
              placeholder="Anything containing 'HTSP' should be 'Transportation', ..."
              onChange={(e) => setRules(e.target.value)}
            />
            <InputGroupAddon>
              <Label>Rules</Label>
            </InputGroupAddon>
          </InputGroup>
          {/* <InputGroup>
DROPDOWN HERE
            <InputGroupInput
      	      type="password"
	      value={apiKey}
	      onChange={(e) => setApiKey(e.target.value)}
      	      placeholder="sk-ant-1234567890abcdef..."
            />
            <InputGroupAddon>
              <Label>API Key</Label>
            </InputGroupAddon>
          </InputGroup>
	  */ }
          <InputGroup>
            <InputGroupInput
      	      type="password"
	      value={apiKey}
	      onChange={(e) => setApiKey(e.target.value)}
      	      placeholder="sk-ant-1234567890abcdef..."
            />
            <InputGroupAddon>
              <Label>API Key</Label>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
