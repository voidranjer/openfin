import React from "react";
import { GrRevert } from "react-icons/gr";
import { MdModeEditOutline } from "react-icons/md";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
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

  const handleCategoriesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCategories(e.target.value);
  };

  const handleRulesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRules(e.target.value);
  };

  const revertToDefault = () => {
    setCategories(defaultCategories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex mb-5">
            <MdModeEditOutline className="me-1" />
            Auto-Category Configuration
          </DialogTitle>
          <div className="flex flex-col space-y-5">
            <InputGroup>
              <InputGroupTextarea
                value={categories}
                onChange={handleCategoriesChange}
                placeholder="Bill Payments, Dining, Education, Entertainment, ..."
              />
              <InputGroupAddon>
                <Label>Categories</Label>
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  title="Revert to default"
                  onClick={revertToDefault}
                >
                  <GrRevert />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupTextarea
                value={rules}
                placeholder="- Anything containing 'HTSP' should be 'Transportation', ..."
                onChange={handleRulesChange}
              />
              <InputGroupAddon>
                <Label>Rules</Label>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
